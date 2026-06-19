import os
import logging

from openai import OpenAI

from .assistant_prompts import INSTRUCTIONS
from .tool_services import (
    SEARCH_TOOLS_SCHEMA,
    make_search_tool_mapping,
    handle_tool_calls_with_reasoning,
)

logger = logging.getLogger(__name__)


def run_assistant(
    message: str,
    user,
    previous_response_id: str | None = None,
) -> tuple[str, str]:
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
    tuple[str, str]
        (final_response_output_text, final_response_id)
    """
    # TODO: Track total duration, cost metrics, and tool_calls_made count
    # and return them from run_assistant for use in eval_assistant.py CSV output

    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    MODEL_DEFAULTS = {
        "instructions": INSTRUCTIONS,
        "model": "gpt-5-nano",  # 400,000 token context window
        # A summary of the reasoning performed by the model. This can be useful for debugging and understanding the model's reasoning process.
        "reasoning": {"effort": "low", "summary": None},
        "tools": SEARCH_TOOLS_SCHEMA,
    }

    # TOOLS_SCHEMA tells the model what tools exist and what arguments to generate.
    # tool_mapping wires those tool names to the Python functions that execute them.
    # They are separate because the model generates arguments (schema concern) but
    # cannot supply request-time values like user (mapping concern).
    tool_mapping = make_search_tool_mapping(user)

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

    return handle_tool_calls_with_reasoning(response, client, MODEL_DEFAULTS, tool_mapping)
