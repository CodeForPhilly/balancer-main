from unittest.mock import MagicMock, patch


def _make_terminal_response(output_text="Final answer.", response_id="resp-1"):
    response = MagicMock()
    response.output = []
    response.output_text = output_text
    response.id = response_id
    return response


# ---------------------------------------------------------------------------
# run_assistant tests
#
# run_assistant is responsible for wiring together the OpenAI client,
# make_search_tool_mapping (which binds user to search_documents), and
# handle_tool_calls_with_reasoning.
#
# We patch the OpenAI client and handle_tool_calls_with_reasoning to test
# that run_assistant correctly assembles and forwards its arguments.
# ---------------------------------------------------------------------------

@patch("api.views.assistant.assistant_services.handle_tool_calls_with_reasoning")
@patch("api.views.assistant.assistant_services.OpenAI")
def test_run_assistant_returns_text_and_id(mock_openai_cls, mock_handle):
    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.responses.create.return_value = _make_terminal_response()
    mock_handle.return_value = ("Final answer.", "resp-1")

    from api.views.assistant.assistant_services import run_assistant

    user = MagicMock()
    text, resp_id = run_assistant(message="What is lithium?", user=user)

    assert text == "Final answer."
    assert resp_id == "resp-1"


@patch("api.views.assistant.assistant_services.handle_tool_calls_with_reasoning")
@patch("api.views.assistant.assistant_services.OpenAI")
def test_run_assistant_sends_message_as_user_input(mock_openai_cls, mock_handle):
    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.responses.create.return_value = _make_terminal_response()
    mock_handle.return_value = ("answer", "resp-1")

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
    mock_handle.return_value = ("answer", "resp-2")

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
    mock_handle.return_value = ("answer", "resp-1")

    from api.views.assistant.assistant_services import run_assistant

    run_assistant(message="First message.", user=MagicMock(), previous_response_id=None)

    call_kwargs = mock_client.responses.create.call_args.kwargs
    assert "previous_response_id" not in call_kwargs


@patch("api.views.assistant.assistant_services.handle_tool_calls_with_reasoning")
@patch("api.views.assistant.assistant_services.OpenAI")
def test_run_assistant_passes_search_tools_schema_to_model(mock_openai_cls, mock_handle):
    from api.views.assistant.assistant_services import run_assistant
    from api.views.assistant.tool_services import SEARCH_TOOLS_SCHEMA

    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.responses.create.return_value = _make_terminal_response()
    mock_handle.return_value = ("answer", "resp-1")

    run_assistant(message="query", user=MagicMock())

    call_kwargs = mock_client.responses.create.call_args.kwargs
    assert call_kwargs.get("tools") == SEARCH_TOOLS_SCHEMA


@patch("api.views.assistant.tool_services.search_documents")
@patch("api.views.assistant.assistant_services.handle_tool_calls_with_reasoning")
@patch("api.views.assistant.assistant_services.OpenAI")
def test_run_assistant_binds_user_to_search_documents(mock_openai_cls, mock_handle, mock_search):
    mock_client = MagicMock()
    mock_openai_cls.return_value = mock_client
    mock_client.responses.create.return_value = _make_terminal_response()
    mock_handle.return_value = ("answer", "resp-1")

    from api.views.assistant.assistant_services import run_assistant

    user = MagicMock()
    run_assistant(message="query", user=user)

    # Extract the tool_mapping passed to handle_tool_calls_with_reasoning
    tool_mapping = mock_handle.call_args.kwargs.get("tool_mapping") or mock_handle.call_args.args[3]
    bound_search = tool_mapping["search_documents"]

    # Calling the bound function should forward user to search_documents
    bound_search(query="test query")
    mock_search.assert_called_once_with("test query", user)
