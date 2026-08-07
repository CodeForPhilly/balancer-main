# Tests for run_assistant (assistant_services.py): the orchestrator that wires the
# OpenAI client, the tool schemas, and the agentic loop together.
#
# The OpenAI client and handle_tool_calls_with_reasoning are mocked, so what remains
# to test is the one decision run_assistant actually makes: whether to include
# previous_response_id in the call at all. Everything else it does is forwarding — a
# hardcoded message dict, TOOLS and user passed straight through to the loop — and
# the tests that asserted those forwards were removed as glue. The only bugs they
# could catch were renames and reorderings, and one of them (`args[3] is TOOLS`) was
# coupled to positional argument order, so it would have gone red on a harmless
# switch to keyword arguments.
#
# Coverage that leaves open, deliberately noted rather than silently dropped:
#   - The user -> run_assistant -> loop leg is no longer asserted. It is a bare
#     positional forward with no decision in it, and the legs on either side are
#     still covered (test_invoke_calls_tool_and_returns_output asserts the loop
#     dispatches run(user=user, ...); test_search_tool_run_forwards_query_and_user
#     asserts the handoff into retrieval).
#   - Nothing asserts that MODEL_DEFAULTS["tools"] == [tool.schema() for tool in
#     TOOLS] reaches the model. That comprehension is a real transformation and is
#     genuinely untested — but it is not what the deleted test checked either.

from unittest.mock import MagicMock, patch

import pytest

from api.views.assistant.agentic_loop import AssistantResult

# Distinguishes "the kwarg was omitted" from "the kwarg was passed as None", which is
# the entire point of the test below. It cannot use dict.get()'s usual None default:
# a regression that sent previous_response_id=None explicitly would then be
# indistinguishable from correctly omitting the key, which is exactly the bug the
# omit-branch exists to prevent.
ABSENT = object()


def _make_terminal_response(output_text="Final answer.", response_id="resp-1"):
    response = MagicMock()
    response.output = []
    response.output_text = output_text
    response.id = response_id
    return response


def _make_result(output_text="answer", response_id="resp-1"):
    return AssistantResult(output_text=output_text, response_id=response_id, tool_calls=[])


@pytest.mark.parametrize(
    "previous_response_id, expected",
    [
        pytest.param("resp-1", "resp-1", id="forwarded-when-provided"),
        pytest.param(None, ABSENT, id="omitted-entirely-when-none"),
    ],
)
@patch("api.views.assistant.assistant_services.handle_tool_calls_with_reasoning")
@patch("api.views.assistant.assistant_services.OpenAI")
def test_run_assistant_includes_previous_response_id_only_when_set(
    mock_openai_cls, mock_handle, previous_response_id, expected
):
    """run_assistant's `if not previous_response_id` branch, both ways.

    Parametrized rather than written twice: the two cases are the same call with one
    input changed, and previously duplicated four lines of client/loop mock setup to
    assert two halves of one decision.

    Asserting on call_args is the only way to see this decision — omitting a kwarg
    has no return-value footprint, since both branches return the same loop result.
    """
    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.responses.create.return_value = _make_terminal_response()
    mock_handle.return_value = _make_result()

    from api.views.assistant.assistant_services import run_assistant

    run_assistant(
        message="Tell me about valproate.",
        user=MagicMock(),
        previous_response_id=previous_response_id,
    )

    call_kwargs = mock_client.responses.create.call_args.kwargs
    assert call_kwargs.get("previous_response_id", ABSENT) == expected
