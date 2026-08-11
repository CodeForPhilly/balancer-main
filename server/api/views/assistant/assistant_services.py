import os
import logging

from openai import OpenAI

from api.views.assistant.assistant_prompts import INSTRUCTIONS
from api.views.assistant.tool_services import TOOLS
from api.views.assistant.assistant_types import AssistantResult
from api.views.assistant.agentic_loop import handle_tool_calls_with_reasoning

logger = logging.getLogger(__name__)

# Module-level so eval_assistant.py can import it and label its CSV with the model that actually ran
MODEL_NAME = "gpt-5-nano"


def run_assistant(
    user,
    message: str,
    previous_response_id: str | None = None,
) -> AssistantResult:
    """
    TODO: Read server/api/views/assistant  and fill in the docstring
    """
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    MODEL_DEFAULTS = {
        "instructions": INSTRUCTIONS,
        "model": MODEL_NAME,
        # TODO: Note how the summary can be used for debugging  and understanding the model's reasoning process.
        "reasoning": {"effort": "low", "summary": None},
        "tools": [tool.schema() for tool in TOOLS],
    }

    if previous_response_id:
        initial_response = client.responses.create(
            input=[
                {"type": "message", "role": "user", "content": str(message)}
            ],
            previous_response_id=str(previous_response_id),
            **MODEL_DEFAULTS,
        )

        # TODO: Explain the reason user is not part of the schema and is bound into each call at dispatch time
        return handle_tool_calls_with_reasoning(response, client, MODEL_DEFAULTS, TOOLS, user)
        

    initial_response = client.responses.create(
        input=[
            {"type": "message", "role": "user", "content": str(message)}
        ],
        **MODEL_DEFAULTS,
    )

    # TODO: Explain the reason user is not part of the schema and is bound into each call at dispatch time
    return handle_tool_calls_with_reasoning(initial_response, client, MODEL_DEFAULTS, TOOLS, user)
