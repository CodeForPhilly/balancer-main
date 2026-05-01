import json
from unittest.mock import MagicMock, patch

from api.views.assistant.tool_services import (
    invoke_functions_from_response,
    handle_tool_calls_with_reasoning,
    make_search_tool_mapping,
)


# ---------------------------------------------------------------------------
# make_search_tool_mapping tests
#
# make_search_tool_mapping is responsible for binding user to search_documents
# so the tool dispatcher can call it with only the query argument the model
# generates. We test the shape of the returned mapping and that user is
# forwarded correctly to search_documents.
# ---------------------------------------------------------------------------

@patch("api.views.assistant.tool_services.search_documents")
def test_make_search_tool_mapping_returns_search_documents_key(mock_search):
    user = MagicMock()
    mapping = make_search_tool_mapping(user)
    assert "search_documents" in mapping


@patch("api.views.assistant.tool_services.search_documents")
def test_make_search_tool_mapping_bound_fn_forwards_user(mock_search):
    mock_search.return_value = "results"
    user = MagicMock()
    mapping = make_search_tool_mapping(user)

    mapping["search_documents"](query="lithium")

    mock_search.assert_called_once_with("lithium", user)


@patch("api.views.assistant.tool_services.search_documents")
def test_make_search_tool_mapping_different_users_are_independent(mock_search):
    # Each call to make_search_tool_mapping should capture its own user,
    # so two mappings created with different users do not share state.
    user_a = MagicMock()
    user_b = MagicMock()
    mapping_a = make_search_tool_mapping(user_a)
    mapping_b = make_search_tool_mapping(user_b)

    mapping_a["search_documents"](query="q")
    mapping_b["search_documents"](query="q")

    calls = mock_search.call_args_list
    assert calls[0] == ((("q", user_a),), {})
    assert calls[1] == ((("q", user_b),), {})


# ---------------------------------------------------------------------------
# invoke_functions_from_response tests
# ---------------------------------------------------------------------------

def _make_function_call_item(name, arguments, call_id):
    item = MagicMock()
    item.type = "function_call"
    item.name = name
    item.arguments = json.dumps(arguments)
    item.call_id = call_id
    return item


def _make_reasoning_item(summary="reasoning summary"):
    item = MagicMock()
    item.type = "reasoning"
    item.summary = summary
    return item


def _make_response(output_items):
    response = MagicMock()
    response.output = output_items
    return response


def test_invoke_returns_empty_list_when_no_function_calls():
    response = _make_response([_make_reasoning_item()])
    result = invoke_functions_from_response(response, tool_mapping={})
    assert result == []


def test_invoke_calls_tool_and_returns_output():
    mock_tool = MagicMock(return_value="search result")
    item = _make_function_call_item("search_documents", {"query": "lithium"}, "call-1")
    response = _make_response([item])

    result = invoke_functions_from_response(
        response, tool_mapping={"search_documents": mock_tool}
    )

    mock_tool.assert_called_once_with(query="lithium")
    assert result == [
        {"type": "function_call_output", "call_id": "call-1", "output": "search result"}
    ]


def test_invoke_returns_error_message_when_tool_not_registered():
    item = _make_function_call_item("unknown_tool", {"query": "x"}, "call-2")
    response = _make_response([item])

    result = invoke_functions_from_response(response, tool_mapping={})

    assert result[0]["call_id"] == "call-2"
    assert "ERROR" in result[0]["output"]


def test_invoke_returns_error_message_when_tool_raises():
    mock_tool = MagicMock(side_effect=Exception("tool exploded"))
    item = _make_function_call_item("search_documents", {"query": "x"}, "call-3")
    response = _make_response([item])

    result = invoke_functions_from_response(
        response, tool_mapping={"search_documents": mock_tool}
    )

    assert "Error executing function call" in result[0]["output"]


def test_invoke_handles_multiple_function_calls():
    mock_tool = MagicMock(return_value="result")
    items = [
        _make_function_call_item("search_documents", {"query": "q1"}, "call-4"),
        _make_function_call_item("search_documents", {"query": "q2"}, "call-5"),
    ]
    response = _make_response(items)

    result = invoke_functions_from_response(
        response, tool_mapping={"search_documents": mock_tool}
    )

    assert len(result) == 2
    assert mock_tool.call_count == 2


# ---------------------------------------------------------------------------
# handle_tool_calls_with_reasoning tests
# ---------------------------------------------------------------------------

def _make_terminal_response(output_text, response_id):
    """A response with no function calls — terminates the loop."""
    response = MagicMock()
    response.output = []
    response.output_text = output_text
    response.id = response_id
    return response


def _make_tool_call_response(response_id, query="lithium"):
    """A response with one function call — continues the loop."""
    response = MagicMock()
    response.output = [_make_function_call_item("search_documents", {"query": query}, "call-loop")]
    response.id = response_id
    return response


def test_handle_terminates_immediately_when_no_tool_calls():
    response = _make_terminal_response("Final answer.", "resp-1")
    client = MagicMock()

    text, resp_id = handle_tool_calls_with_reasoning(
        response, client, model_defaults={}, tool_mapping={}
    )

    assert text == "Final answer."
    assert resp_id == "resp-1"
    client.responses.create.assert_not_called()


def test_handle_calls_tool_then_terminates():
    mock_search = MagicMock(return_value="doc content")
    first_response = _make_tool_call_response("resp-1")
    second_response = _make_terminal_response("Final answer.", "resp-2")

    client = MagicMock()
    client.responses.create.return_value = second_response

    text, resp_id = handle_tool_calls_with_reasoning(
        first_response,
        client,
        model_defaults={},
        tool_mapping={"search_documents": mock_search},
    )

    mock_search.assert_called_once_with(query="lithium")
    assert text == "Final answer."
    assert resp_id == "resp-2"


def test_handle_passes_previous_response_id_on_followup():
    mock_search = MagicMock(return_value="doc content")
    first_response = _make_tool_call_response("resp-1")
    second_response = _make_terminal_response("Done.", "resp-2")

    client = MagicMock()
    client.responses.create.return_value = second_response

    handle_tool_calls_with_reasoning(
        first_response,
        client,
        model_defaults={},
        tool_mapping={"search_documents": mock_search},
    )

    call_kwargs = client.responses.create.call_args.kwargs
    assert call_kwargs["previous_response_id"] == "resp-1"
