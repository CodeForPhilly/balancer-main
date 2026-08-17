import os
import logging

from openai import OpenAI

from api.views.assistant.assistant_prompts import INSTRUCTIONS
from api.views.assistant.tool_services import TOOLS
from api.views.assistant.assistant_types import AgentResult
from api.views.assistant.agentic_loop import run_agentic_loop

logger = logging.getLogger(__name__)

# Module-level so eval_assistant.py can import it and label its CSV with the model that actually ran
MODEL_NAME = "gpt-5-nano"


def run_assistant(
    user,
    message: str,
    previous_response_id: str | None = None,
) -> AgentResult:

    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    MODEL_DEFAULTS = {
        "instructions": INSTRUCTIONS,
        "model": MODEL_NAME,
        # TODO: Flip "summary" to "auto" once this org is confirmed verified with OpenAI
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

        # search_documents needs the request user for document access control
        return run_agentic_loop(initial_response, client, MODEL_DEFAULTS, TOOLS, user)

    initial_response = client.responses.create(
        input=[
            {"type": "message", "role": "user", "content": str(message)}
        ],
        **MODEL_DEFAULTS,
    )

    # search_documents needs the request user for document access control
    return run_agentic_loop(initial_response, client, MODEL_DEFAULTS, TOOLS, user)
