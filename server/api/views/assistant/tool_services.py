from api.views.assistant.assistant_types import Tool
# Keep this as a bare-name import: rewriting SEARCH_TOOL.run to call
# search_tool.search_documents(...) would move the patch target and break the tests.
from api.views.assistant.search_tool import search_documents
# Reuse the existing ask_database implementation from services/tools rather than
# reimplementing it here — it already enforces the SELECT-only and ALLOWED_TABLES
# guards, and does no DB work at import time.
from api.services.tools.database import ask_database


SEARCH_TOOL = Tool(
    name="search_documents",
    description="""
Search the user's uploaded documents for information relevant to answering their question.
Call this function when you need to find specific information from the user's documents
to provide an accurate, citation-backed response. Always search before answering questions
about document content.
""",
    parameters={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": """
A specific search query to find relevant information in the user's documents.
Use keywords, phrases, or questions related to what the user is asking about.
Be specific rather than generic - use terms that would appear in the relevant documents.
""",
            }
        },
        "required": ["query"],
    },
    # search_documents needs the request user for document access control.
    run=lambda user, query: search_documents(query, user),
)


# The schema string describing the queryable medication table for ask_database's prompt.
#
# Kept in sync by hand with api.views.listMeds.models.Medication: if you add/rename a
# column there, update this string so ask_database's prompt matches the real table.
#
# Hand-writing the column list (rather than deriving it from Django's Model._meta) is a
# deliberate trade-off. _meta.concrete_fields would auto-sync with the model and needs no
# DB connection, but it dumps *every* column indiscriminately. A hand-written list lets us
# curate what the LLM sees — e.g. omit `id`, which the model never needs to filter on — and
# it drops the app-registry dependency (_meta requires the app registry loaded, so importing
# this module during app startup could raise AppRegistryNotReady). The cost is the manual
# update above, cheap for a table this small and stable.
_MEDICATION_SCHEMA_STRING = "Table: api_medication\nColumns: name, benefits, risks"

# Sharpen this description — it is the highest-value change on this branch, and
# there are now two eval runs of evidence behind it. Across 14 tool calls over those two
# runs the model selected ask_database exactly 0 times. Decisively, for "What medications
# are recommended for bipolar depression?" it generated a semantic search query rather
# than SELECT name, benefits, risks FROM api_medication, despite that being a literal
# match for this table.
#
# The descriptions explain the split. SEARCH_TOOL's ends with a standing order ("Always
# search before answering questions about document content"); this one opens with a scope
# sentence and then spends its remaining length on SQL mechanics (brand→generic,
# LOWER() matching). One commands, the other documents syntax — so the model reads only
# the first as an instruction about *when* to call.
#
# The fix is ordering, not length: lead with when to prefer this over semantic search
# (exact medication attributes, enumerating the catalog, any question answerable from
# name/benefits/risks) and move the SQL mechanics down into the `query` parameter
# description, where they belong — that text is read when writing the argument, not when
# choosing the tool. Consider a matching "prefer ask_database for ..." clause in
# SEARCH_TOOL so the carve-out is stated from both sides. Re-run the eval afterwards:
# selection count is the measurement, and it is already baselined at 0.
ASK_DATABASE_TOOL = Tool(
    name="ask_database",
    description="""
Use this tool to answer questions about the medications in the Balancer database.
Medications are stored by their official generic names, not brand names, so convert
brand names to generic names first and match case-insensitively
(e.g. LOWER(name) = LOWER('lurasidone')). The input must be a single, fully-formed
SQL SELECT query.
""",
    parameters={
        "type": "object",
        "properties": {
            "query": {
                "type": "string",
                "description": (
                    "A plain-text SQL SELECT query answering the user's question, "
                    "written against this schema:\n"
                    f"{_MEDICATION_SCHEMA_STRING}"
                ),
            }
        },
        "required": ["query"],
    },
    # ask_database queries the shared medication table, so it ignores the request user.
    run=lambda user, query: ask_database(query),
)


# Single source of truth for the assistant's tools. assistant_services builds the
# schema list the model sees with [tool.schema() for tool in TOOLS]; the agentic loop
# indexes this by name to dispatch calls. Register a new tool by appending it here.
#
# OVERLAP RISK — no longer hypothetical: this exposes a semantic document-search tool AND
# a SQL medication-lookup tool at once, and for a question both could answer the model has
# resolved it entirely in favour of search_documents (0 ask_database selections in 14 tool
# calls across two eval runs). The lever is sharper descriptions carving out when to prefer
# which — see the TODO above ASK_DATABASE_TOOL — not a third overlapping tool.
TOOLS = [SEARCH_TOOL, ASK_DATABASE_TOOL]
