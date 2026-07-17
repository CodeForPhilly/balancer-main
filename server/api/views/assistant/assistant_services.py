import os
import logging

from openai import OpenAI

from .assistant_prompts import INSTRUCTIONS
from .tool_services import TOOLS
from .agentic_loop import handle_tool_calls_with_reasoning

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
