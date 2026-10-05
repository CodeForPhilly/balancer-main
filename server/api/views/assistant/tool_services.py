from api.views.assistant.assistant_types import Tool
from api.views.assistant.search_tool import search_documents
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
# Kept in sync by hand with api.views.listMeds.models.Medication rather than deriving it from 
# Django's Model._meta because the table is small and stable

_MEDICATION_SCHEMA_STRING = "Table: api_medication\nColumns: name, benefits, risks"


# TODO: Rewrite the description as a directive like SEARCH_TOOL's — it documents SQL syntax instead
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

    # Reuses ask_database from services/tools. Its guards are substring checks, so they
    # can be bypassed (UNION, a second statement), and it returns errors as strings, so
    # a failed query would be recorded as OK. See the note at TOOLS.

    # ask_database queries the shared medication table, so it ignores the request user.
    run=lambda user, query: ask_database(query),
)


# Single source of truth for the assistant's tools. assistant_services builds the
# schema list the model sees with [tool.schema() for tool in TOOLS]; the agentic loop
# indexes this by name to dispatch calls. Register a new tool by appending it here.

# ASK_DATABASE_TOOL is deliberately not registered: the endpoint is public (AllowAny), and
# ask_database can't safely run model-written SQL. Re-register it once it allows only a
# single statement, validates every table it reads, runs under a read-only database role,
# and raises on failure.
TOOLS = [SEARCH_TOOL]
