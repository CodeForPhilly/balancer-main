# Tests for the assistant's tools and the agentic reasoning loop.
#
# Covers the logic these modules own, with mocked tools (no DB, no OpenAI):
#   - Tool instances: SEARCH_TOOL.run forwards the request user; ASK_DATABASE_TOOL.run
#     ignores it; schema() emits the flattened Responses-API shape.
#   - invoke_functions_from_response: dispatching the model's function calls — the
#     call/no-call branch, output shaping, and the unregistered-tool and tool-raises
#     error paths. Tools are indexed by name and invoked as tool.run(user, **arguments).
#   - handle_tool_calls_with_reasoning: the while-loop that keeps calling the model
#     until it stops emitting tool calls, including loop continuity via
#     previous_response_id.

import json
from unittest.mock import MagicMock, patch

# TODO: add coverage for search_documents itself (formatting of embeddings
# results, the empty-results message, and the exception path). No DB needed:
# search_documents only calls get_closest_embeddings and convert_uuids, so
# mocking those two (like the rest of the suite mocks collaborators) covers all
# three paths as fast, DB-free unit tests.

from api.views.assistant.agentic_loop import (
    invoke_functions_from_response,
    handle_tool_calls_with_reasoning,
    AssistantResult,
    ToolCall,
    ToolCallStatus,
)
from api.views.assistant.tool_services import Tool, SEARCH_TOOL, ASK_DATABASE_TOOL, TOOLS


# ---------------------------------------------------------------------------
# Tool instances
# ---------------------------------------------------------------------------

@patch("api.views.assistant.tool_services.search_documents")
def test_search_tool_run_forwards_query_and_user(mock_search):
    mock_search.return_value = "results"
    user = MagicMock()

    SEARCH_TOOL.run(user=user, query="lithium")

    mock_search.assert_called_once_with("lithium", user)


@patch("api.views.assistant.tool_services.ask_database")
def test_ask_database_tool_run_ignores_user(mock_ask):
    mock_ask.return_value = "rows"

    ASK_DATABASE_TOOL.run(user=MagicMock(), query="SELECT 1")

    # user is not forwarded — ask_database queries the shared medication table.
    mock_ask.assert_called_once_with("SELECT 1")


def test_tool_schema_is_flattened_shape():
    schema = SEARCH_TOOL.schema()
    assert schema["type"] == "function"
    assert schema["name"] == "search_documents"
    assert "parameters" in schema
    # Flattened Responses-API shape — not nested under a "function" key.
    assert "function" not in schema


def test_tools_registry_contains_both_tools():
    names = {tool.name for tool in TOOLS}
    assert names == {"search_documents", "ask_database"}


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


def _fake_tool(name, run):
    """A Tool whose run is a mock; description/parameters are irrelevant to dispatch."""
    return Tool(name=name, description="", parameters={}, run=run)


def test_invoke_returns_empty_lists_when_no_function_calls():
    response = _make_response([_make_reasoning_item()])
    messages, calls = invoke_functions_from_response(response, tools=[], user=MagicMock())
    assert messages == []
    assert calls == []


def test_invoke_calls_tool_and_returns_output():
    mock_run = MagicMock(return_value="search result")
    tool = _fake_tool("search_documents", mock_run)
    user = MagicMock()
    item = _make_function_call_item("search_documents", {"query": "lithium"}, "call-1")
    response = _make_response([item])

    messages, calls = invoke_functions_from_response(response, tools=[tool], user=user)

    # The loop binds user at dispatch and forwards the model's arguments.
    mock_run.assert_called_once_with(user=user, query="lithium")
    # The OpenAI payload (unchanged shape) is the first return value.
    assert messages == [
        {"type": "function_call_output", "call_id": "call-1", "output": "search result"}
    ]
    # The ToolCall record captures the outcome, the model's query, and the output.
    assert calls == [
        ToolCall(
            name="search_documents",
            status=ToolCallStatus.OK,
            arguments={"query": "lithium"},
            output="search result",
        )
    ]


def test_invoke_records_unregistered_when_tool_not_registered():
    item = _make_function_call_item("unknown_tool", {"query": "x"}, "call-2")
    response = _make_response([item])

    messages, calls = invoke_functions_from_response(response, tools=[], user=MagicMock())

    assert messages[0]["call_id"] == "call-2"
    assert "ERROR" in messages[0]["output"]
    assert calls[0].name == "unknown_tool"
    assert calls[0].status is ToolCallStatus.UNREGISTERED
    assert calls[0].error is not None


def test_invoke_records_failed_when_tool_raises():
    mock_run = MagicMock(side_effect=Exception("tool exploded"))
    tool = _fake_tool("search_documents", mock_run)
    item = _make_function_call_item("search_documents", {"query": "x"}, "call-3")
    response = _make_response([item])

    messages, calls = invoke_functions_from_response(response, tools=[tool], user=MagicMock())

    assert "Error executing function call" in messages[0]["output"]
    assert calls[0].status is ToolCallStatus.FAILED
    assert "tool exploded" in calls[0].error
    # arguments parsed before the tool raised, so they are still captured.
    assert calls[0].arguments == {"query": "x"}


def test_invoke_handles_multiple_function_calls():
    mock_run = MagicMock(return_value="result")
    tool = _fake_tool("search_documents", mock_run)
    items = [
        _make_function_call_item("search_documents", {"query": "q1"}, "call-4"),
        _make_function_call_item("search_documents", {"query": "q2"}, "call-5"),
    ]
    response = _make_response(items)

    messages, calls = invoke_functions_from_response(response, tools=[tool], user=MagicMock())

    assert len(messages) == 2
    assert len(calls) == 2
    assert mock_run.call_count == 2


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

    result = handle_tool_calls_with_reasoning(
        response, client, model_defaults={}, tools=[], user=MagicMock()
    )

    assert isinstance(result, AssistantResult)
    assert result.output_text == "Final answer."
    assert result.response_id == "resp-1"
    assert result.tool_calls == []
    client.responses.create.assert_not_called()


def test_handle_calls_tool_then_terminates():
    mock_run = MagicMock(return_value="doc content")
    tool = _fake_tool("search_documents", mock_run)
    first_response = _make_tool_call_response("resp-1")
    second_response = _make_terminal_response("Final answer.", "resp-2")

    client = MagicMock()
    client.responses.create.return_value = second_response
    user = MagicMock()

    result = handle_tool_calls_with_reasoning(
        first_response, client, model_defaults={}, tools=[tool], user=user
    )

    mock_run.assert_called_once_with(user=user, query="lithium")
    assert result.output_text == "Final answer."
    assert result.response_id == "resp-2"
    # The one tool call from the first turn is recorded on the result.
    assert [c.name for c in result.tool_calls] == ["search_documents"]
    assert result.tool_calls[0].status is ToolCallStatus.OK


def test_handle_accumulates_tool_calls_across_iterations():
    mock_run = MagicMock(return_value="doc content")
    tool = _fake_tool("search_documents", mock_run)
    # Two tool-calling turns, then a terminal one.
    first_response = _make_tool_call_response("resp-1", query="q1")
    second_response = _make_tool_call_response("resp-2", query="q2")
    third_response = _make_terminal_response("Final answer.", "resp-3")

    client = MagicMock()
    client.responses.create.side_effect = [second_response, third_response]

    result = handle_tool_calls_with_reasoning(
        first_response, client, model_defaults={}, tools=[tool], user=MagicMock()
    )

    # Tool calls from every loop iteration are collected into one flat list.
    assert len(result.tool_calls) == 2
    assert [c.arguments for c in result.tool_calls] == [{"query": "q1"}, {"query": "q2"}]
    assert result.response_id == "resp-3"


def test_handle_passes_previous_response_id_on_followup():
    mock_run = MagicMock(return_value="doc content")
    tool = _fake_tool("search_documents", mock_run)
    first_response = _make_tool_call_response("resp-1")
    second_response = _make_terminal_response("Done.", "resp-2")

    client = MagicMock()
    client.responses.create.return_value = second_response

    handle_tool_calls_with_reasoning(
        first_response, client, model_defaults={}, tools=[tool], user=MagicMock()
    )

    call_kwargs = client.responses.create.call_args.kwargs
    assert call_kwargs["previous_response_id"] == "resp-1"
