# Tests for run_assistant (assistant_services.py): the orchestrator that wires the
# OpenAI client, the tool schemas, and the agentic loop together.
#
# The OpenAI client and handle_tool_calls_with_reasoning are mocked, so these
# tests cover only logic run_assistant owns: how it builds the user input message,
# its decision to include vs. omit previous_response_id, and that it forwards the
# TOOLS and the request user to the loop. No live OpenAI calls and no database.

from unittest.mock import MagicMock, patch

from api.views.assistant.agentic_loop import AssistantResult


def _make_terminal_response(output_text="Final answer.", response_id="resp-1"):
    response = MagicMock()
    response.output = []
    response.output_text = output_text
    response.id = response_id
    return response


def _make_result(output_text="answer", response_id="resp-1"):
    return AssistantResult(output_text=output_text, response_id=response_id, tool_calls=[])

@patch("api.views.assistant.assistant_services.handle_tool_calls_with_reasoning")
@patch("api.views.assistant.assistant_services.OpenAI")
def test_run_assistant_sends_message_as_user_input(mock_openai_cls, mock_handle):
    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.responses.create.return_value = _make_terminal_response()
    mock_handle.return_value = _make_result()

    from api.views.assistant.assistant_services import run_assistant

    run_assistant(message="Tell me about valproate.", user=MagicMock())

    call_kwargs = mock_client.responses.create.call_args
    input_messages = call_kwargs.kwargs.get("input") or call_kwargs.args[0]
    assert any(
        item.get("role") == "user" and "valproate" in item.get("content", "")
        for item in input_messages
    )


@patch("api.views.assistant.assistant_services.handle_tool_calls_with_reasoning")
@patch("api.views.assistant.assistant_services.OpenAI")
def test_run_assistant_passes_previous_response_id(mock_openai_cls, mock_handle):
    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.responses.create.return_value = _make_terminal_response()
    mock_handle.return_value = _make_result(response_id="resp-2")

    from api.views.assistant.assistant_services import run_assistant

    run_assistant(message="More info.", user=MagicMock(), previous_response_id="resp-1")

    call_kwargs = mock_client.responses.create.call_args.kwargs
    assert call_kwargs.get("previous_response_id") == "resp-1"


@patch("api.views.assistant.assistant_services.handle_tool_calls_with_reasoning")
@patch("api.views.assistant.assistant_services.OpenAI")
def test_run_assistant_omits_previous_response_id_when_none(mock_openai_cls, mock_handle):
    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.responses.create.return_value = _make_terminal_response()
    mock_handle.return_value = _make_result()

    from api.views.assistant.assistant_services import run_assistant

    run_assistant(message="First message.", user=MagicMock(), previous_response_id=None)

    call_kwargs = mock_client.responses.create.call_args.kwargs
    assert "previous_response_id" not in call_kwargs


@patch("api.views.assistant.assistant_services.handle_tool_calls_with_reasoning")
@patch("api.views.assistant.assistant_services.OpenAI")
def test_run_assistant_forwards_tools_and_user_to_loop(mock_openai_cls, mock_handle):
    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.responses.create.return_value = _make_terminal_response()
    mock_handle.return_value = _make_result()

    from api.views.assistant.assistant_services import run_assistant
    from api.views.assistant.tool_services import TOOLS

    user = MagicMock()
    run_assistant(message="query", user=user)

    # run_assistant no longer binds user itself — it forwards TOOLS and the user to the
    # loop, which binds user into each tool call at dispatch time.
    # handle_tool_calls_with_reasoning(response, client, model_defaults, tools, user)
    args = mock_handle.call_args.args
    assert args[3] is TOOLS
    assert args[4] is user
