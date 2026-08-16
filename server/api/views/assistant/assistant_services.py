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
    """
    TODO: Read server/api/views/assistant  and fill in the docstring
    """

    # TODO: Track cost metrics in eval_assistant.py
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

    MODEL_DEFAULTS = {
        "instructions": INSTRUCTIONS,
        "model": MODEL_NAME,
        # TODO: flip "summary" back to "auto" once this org is confirmed verified with
        # OpenAI. Reverted from "auto" because reasoning summaries on the gpt-5 family
        # can be gated behind organization verification: an unverified org gets a 400
        # from every responses.create, so the assistant would fail closed for every
        # user on the first turn rather than degrade. One real call against the
        # configured key settles it — this is not something to find out in production.
        #
        # While this stays None, reasoning items carry no summary, which makes
        # agentic_loop.py's `logger.info(f"Reasoning step: {response_item.summary}")`
        # inert. That log line and this key are one change, not two — flipping this
        # without checking that line just prints None on every reasoning item.
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
        return run_agentic_loop(initial_response, client, MODEL_DEFAULTS, TOOLS, user)

    initial_response = client.responses.create(
        input=[
            {"type": "message", "role": "user", "content": str(message)}
        ],
        **MODEL_DEFAULTS,
    )

    # TODO: Explain the reason user is not part of the schema and is bound into each call at dispatch time
    return run_agentic_loop(initial_response, client, MODEL_DEFAULTS, TOOLS, user)
