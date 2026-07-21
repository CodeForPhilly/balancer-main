from dataclasses import dataclass
from typing import Callable

# search_documents is defined in search_tool.py; this `from ... import` binds a local
# name, api.views.assistant.tool_services.search_documents, that SEARCH_TOOL.run looks
# up at call time. Tests patch that local name — the use site here, NOT the definition
# site (search_tool.search_documents) — because mock.patch must rebind the reference the
# code actually resolves. Keep this as a bare-name import: rewriting SEARCH_TOOL.run to
# call search_tool.search_documents(...) would move the patch target and break the tests.
from api.views.assistant.search_tool import search_documents
# Reuse the existing ask_database implementation from services/tools rather than
# reimplementing it here — it already enforces the SELECT-only and ALLOWED_TABLES
# guards, and does no DB work at import time. Same use-site patching applies: tests patch
# api.views.assistant.tool_services.ask_database (the name bound here), not the definition
# in api.services.tools.database.
from api.services.tools.database import ask_database


@dataclass(frozen=True)
class Tool:
    """One assistant tool: the schema the model sees (data) and the function we run
    (behavior), bundled together under a single name.

    Bundling name/description/parameters/run in one object means each tool is
    registered in exactly one place — the TOOLS list at the bottom of this module —
    so the schema sent to the model and the callable actually invoked can never drift
    apart. Adding a tool is appending one Tool to TOOLS; nothing else changes.

    Behavior is stored as the `run` field (composition) rather than a method on a
    subclass because our tools differ only in *which* function runs — same schema()
    machinery, same fields, just a different callable. They are instances of one
    concept, not distinct kinds of thing.

    TODO: Flip to `Tool(ABC)` + one subclass per tool (with `run` as a method) if a
    tool ever needs more than a swapped-in function — specifically when it:
      - carries per-type state/setup (a client, connection, cache, validated config);
      - overrides more than run (e.g. a custom schema() shape, or extra methods like
        validate_arguments / cost_estimate);
      - needs a per-type run signature or an @abstractmethod-enforced contract so a
        tool with no behavior fails at class-definition time, not at call time.
    Until then the callable field is lighter and keeps registration drift-proof.
    """

    name: str
    description: str
    parameters: dict
    # run(user, **arguments) -> str. Every tool takes the request `user` so the dispatch
    # loop can call them uniformly; a tool that doesn't need it simply ignores it.
    run: Callable

    def schema(self) -> dict:
        # Flattened Responses-API shape: name/description/parameters at the top level.
        # This is intentionally NOT the nested {"function": {...}} shape that the Chat
        # Completions API (and services/tools/tools.py's create_tool_dict) uses.
        return {
            "type": "function",
            "name": self.name,
            "description": self.description,
            "parameters": self.parameters,
        }



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
# OVERLAP RISK: this exposes a semantic document-search tool AND a SQL medication-lookup
# tool at once. For a question both could answer, the model chooses which to call and
# they can conflict. If that becomes a problem, sharpen each tool's description to carve
# out when to prefer which rather than adding more overlapping tools.
TOOLS = [SEARCH_TOOL, ASK_DATABASE_TOOL]
