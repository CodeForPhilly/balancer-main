from typing import Callable

# make_search_tool_mapping (below) calls search_documents, which now lives in its own
# module after the refactor — import it directly from there.
from .search_tool import search_documents
# Reuse the existing ask_database implementation from services/tools rather than
# reimplementing it here — it already enforces the SELECT-only and ALLOWED_TABLES
# guards. It takes no request-time secret (no `user`), so it is safe to import at
# module top level; database.py does no DB work at import time.
#
# IMPORT-TIME DB ACCESS: we import the ask_database *function* here (cheap, no DB),
# NOT database_schema_string from services/tools/tools.py. That module runs
# get_database_info(connection) at *its* import time to build the schema string, so
# importing it at module top level would fire a DB query just to import this file
# (breaking manage.py commands / any context where the DB isn't ready).
# _build_ask_database_schema() therefore defers that import to call time instead.
from ...services.tools.database import ask_database

# TODO: Add keyword tool if it doesn't overlap with semantic search 
# because too many overlapping tools can return conflicting answers 

# get_tools_schema / make_tool_mapping are the aggregation seam: assistant_services.py
# reads these two functions instead of naming individual tools. That way a new tool is
# added by editing ONLY this file (append its schema below, register its callable in the
# mapping) — assistant_services.py never has to change again.
def get_tools_schema() -> list[dict]:
    """Return every tool schema the assistant exposes to the model.

    assistant_services.py reads this instead of naming individual schemas, so adding a
    tool means appending here — not editing assistant_services.py.
    """
    # OVERLAP RISK: this exposes a semantic document-search tool AND a SQL
    # medication-lookup tool at the same time. For a question both could plausibly
    # answer, the model chooses which to call, and they can return conflicting
    # answers. If that becomes a problem, sharpen each tool's description to carve
    # out when to prefer which (unstructured docs/citations vs. structured
    # medication facts) rather than adding yet more overlapping tools — see the
    # keyword-tool TODO at the top of this module.
    return SEARCH_TOOLS_SCHEMA + [_build_ask_database_schema()]


def make_tool_mapping(user) -> dict[str, Callable]:
    """Return the full name->callable mapping for every tool.

    ask_database needs no request-time binding (it queries the shared medication table,
    not per-user data), so it is registered directly. search_documents is bound to the
    user via make_search_tool_mapping. Reuses ask_database from services/tools.
    """
    return {
        **make_search_tool_mapping(user),
        "ask_database": ask_database,
    }




SEARCH_TOOL_DESCRIPTION = """
Search the user's uploaded documents for information relevant to answering their question.
Call this function when you need to find specific information from the user's documents
to provide an accurate, citation-backed response. Always search before answering questions
about document content.
"""

SEARCH_TOOL_PROPERTY_DESCRIPTION = """
A specific search query to find relevant information in the user's documents.
Use keywords, phrases, or questions related to what the user is asking about.
Be specific rather than generic - use terms that would appear in the relevant documents.
"""

# SEARCH_TOOLS_SCHEMA defines the search_documents tool for the OpenAI API.
# The model reads this schema to know what tools are available and what
# arguments to generate — it can only generate arguments declared here.
SEARCH_TOOLS_SCHEMA = [
    {
        "type": "function",
        "name": "search_documents",
        "description": SEARCH_TOOL_DESCRIPTION,
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": SEARCH_TOOL_PROPERTY_DESCRIPTION,
                }
            },
            "required": ["query"],
        },
    }
]


def make_search_tool_mapping(user) -> dict[str, Callable]:
    # make_search_tool_mapping binds user to search_documents at call time.
    # user is a request-time value the model cannot generate, so it must be
    # captured here and kept out of the schema.
    """Return a tool mapping with search_documents bound to the given user.

    Parameters
    ----------
    user : User
        The Django user object used for document access control.

    Returns
    -------
    dict[str, Callable]
        Tool mapping ready to pass to invoke_functions_from_response.
    """
    def bound_search(query: str) -> str:
        return search_documents(query, user)

    return {"search_documents": bound_search}


ASK_DATABASE_TOOL_DESCRIPTION = """
Use this tool to answer questions about the medications in the Balancer database.
Medications are stored by their official generic names, not brand names, so convert
brand names to generic names first and match case-insensitively
(e.g. LOWER(name) = LOWER('lurasidone')). The input must be a single, fully-formed
SQL SELECT query.
"""


def _build_ask_database_schema() -> dict:
    """Build the ask_database tool schema in the flattened Responses-API shape.

    The table/column names the model may query are injected from the live database
    schema (reused from services/tools). The import is deferred to call time so that
    merely importing this module never triggers a database query.
    """
    # Deferred (function-local) import on purpose: services/tools/tools.py builds
    # database_schema_string by querying the DB at *its* import time. Importing it
    # here at call time keeps that query out of this module's import, so loading the
    # assistant (e.g. during manage.py commands or when the DB isn't ready) never
    # triggers it. We reuse the prebuilt string instead of rebuilding the schema.
    from ...services.tools.tools import database_schema_string

    # Flattened Responses-API shape: name/description/parameters live at the top level.
    # This is intentionally NOT the nested {"function": {...}} shape that
    # services/tools/tools.py's create_tool_dict produces for the Chat Completions API —
    # which is also why create_tool_dict could not be reused here.
    return {
        "type": "function",
        "name": "ask_database",
        "description": ASK_DATABASE_TOOL_DESCRIPTION,
        "parameters": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "description": (
                        "A plain-text SQL SELECT query answering the user's question, "
                        "written against this schema:\n"
                        f"{database_schema_string}"
                    ),
                }
            },
            "required": ["query"],
        },
    }
