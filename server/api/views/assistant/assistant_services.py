import os
import logging

from openai import OpenAI

from api.views.assistant.assistant_prompts import INSTRUCTIONS
from api.views.assistant.tool_services import TOOLS
from api.views.assistant.agentic_loop import (
    handle_tool_calls_with_reasoning,
    AssistantResult,
)

logger = logging.getLogger(__name__)


def run_assistant(
    message: str,
    user,
    previous_response_id: str | None = None,
) -> AssistantResult:
    """Wire together the OpenAI client, retrieval, and the agentic reasoning loop.

    Parameters
    ----------
    message : str
        The user's input message.
    user : User
        The Django user object used for document access control in search_documents.
    previous_response_id : str | None
        ID of a prior response for multi-turn conversation continuity.

    Returns
    -------
    AssistantResult
        The final response text and id, plus the ToolCall records made during the run.
        Built by the loop and passed straight through — this function does not repack it.
    """
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    MODEL_DEFAULTS = {
        "instructions": INSTRUCTIONS,
        "model": "gpt-5-nano",  # 400,000 token context window
        # A summary of the reasoning performed by the model. This can be useful for debugging and understanding the model's reasoning process.
        "reasoning": {"effort": "low", "summary": None},
        # The model only ever sees each tool's schema (name/description/parameters),
        # derived from the single TOOLS list in tool_services.py. The request `user` is
        # not part of the schema — it is bound into each call later, at dispatch time.
        "tools": [tool.schema() for tool in TOOLS],
    }

    if not previous_response_id:
        response = client.responses.create(
            input=[
                {"type": "message", "role": "user", "content": str(message)}
            ],
            **MODEL_DEFAULTS,
        )
    else:
        response = client.responses.create(
            input=[
                {"type": "message", "role": "user", "content": str(message)}
            ],
            previous_response_id=str(previous_response_id),
            **MODEL_DEFAULTS,
        )

    # Pass TOOLS and user through to the loop, which indexes tools by name and binds
    # user into each tool call at dispatch time.
    return handle_tool_calls_with_reasoning(response, client, MODEL_DEFAULTS, TOOLS, user)
