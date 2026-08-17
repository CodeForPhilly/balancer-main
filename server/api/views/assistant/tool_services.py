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

    # Keep this as a bare-name import: rewriting SEARCH_TOOL.run to call
    # search_tool.search_documents(...) would move the patch target and break the tests.
    
    # search_documents needs the request user for document access control.
    run=lambda user, query: search_documents(query, user),
)

# The schema string describing the queryable medication table for ask_database's prompt.
# Kept in sync by hand with api.views.listMeds.models.Medication rather than deriving it from 
# Django's Model._meta becuase the table is small and stable

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

    # Reuse the existing ask_database implementation from services/tools rather than
    # reimplementing it here — it already enforces the SELECT-only and ALLOWED_TABLES
    # guards, and does no DB work at import time.


    # ask_database queries the shared medication table, so it ignores the request user.
    run=lambda user, query: ask_database(query),
)


# Single source of truth for the assistant's tools. assistant_services builds the
# schema list the model sees with [tool.schema() for tool in TOOLS]; the agentic loop
# indexes this by name to dispatch calls. Register a new tool by appending it here.

TOOLS = [SEARCH_TOOL, ASK_DATABASE_TOOL]
