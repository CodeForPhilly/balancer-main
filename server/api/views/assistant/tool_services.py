from dataclasses import dataclass
from typing import Callable

# search_documents lives in its own module; imported here so SEARCH_TOOL.run can call
# it (and so tests can patch api.views.assistant.tool_services.search_documents).
from .search_tool import search_documents
# Reuse the existing ask_database implementation from services/tools rather than
# reimplementing it here — it already enforces the SELECT-only and ALLOWED_TABLES
# guards, and does no DB work at import time.
from ...services.tools.database import ask_database
# The Medication model is the source of truth for the queryable columns; we read them
# from its metadata (below) instead of introspecting the live database.
from ..listMeds.models import Medication


@dataclass(frozen=True)
class Tool:
    """One assistant tool: the schema the model sees (data) and the function we run
    (behavior), bundled together under a single name.

    Bundling name/description/parameters/run in one object means each tool is
    registered in exactly one place — the TOOLS list at the bottom of this module —
    so the schema sent to the model and the callable actually invoked can never drift
    apart. Adding a tool is appending one Tool to TOOLS; nothing else changes.
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


def _medication_schema_string() -> str:
    """Describe the queryable medication table for the ask_database tool's prompt.

    The column list is read from the Medication model's metadata (``Model._meta``),
    which Django populates from the class definition at import — so this needs no
    database connection. That is why building the ask_database Tool below never
    triggers a query (unlike introspecting information_schema over a live connection).
    """
    meta = Medication._meta
    columns = ", ".join(field.column for field in meta.concrete_fields)
    return f"Table: {meta.db_table}\nColumns: {columns}"


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
                    f"{_medication_schema_string()}"
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
