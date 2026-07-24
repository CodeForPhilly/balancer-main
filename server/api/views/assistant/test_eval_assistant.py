# Tests for run_one (eval_assistant.py): the helper that runs the assistant for a
# single eval question and shapes the outcome into a result row.
#
# run_assistant is mocked, so this covers the logic run_one owns — specifically
# that a raising question is captured as an error row (error text recorded,
# response left None) instead of aborting the whole eval batch.

from unittest.mock import MagicMock, patch

from api.views.assistant.eval_assistant import run_one

# TODO: add coverage for main()'s CSV output.

@patch("api.views.assistant.eval_assistant.run_assistant", side_effect=Exception("boom"))
def test_run_one_captures_error(mock_run_assistant):
    row = run_one("query", user=MagicMock(), branch="feature")

    assert row["branch"] == "feature"
    assert row["response_output_text"] is None
    assert "boom" in row["error"]
    # The error row carries the same tool/duration columns (defaulted) so the
    # DataFrame is not ragged, and still records time-to-failure.
    assert row["tools_called"] == ""
    assert row["tool_call_count"] == 0
    assert row["tool_error_count"] == 0
    assert row["tool_calls_json"] is None
    assert "duration_s" in row


@patch("api.views.assistant.eval_assistant.run_assistant")
def test_run_one_records_tool_calls(mock_run_assistant):
    from api.views.assistant.agentic_loop import AssistantResult, ToolCall, ToolCallStatus

    mock_run_assistant.return_value = AssistantResult(
        output_text="answer",
        response_id="resp-1",
        tool_calls=[
            ToolCall(name="search_documents", status=ToolCallStatus.OK,
                     arguments={"query": "lithium"}, output="docs"),
            ToolCall(name="ask_database", status=ToolCallStatus.FAILED,
                     arguments={"query": "SELECT"}, error="bad sql"),
        ],
    )

    row = run_one("query", user=MagicMock(), branch="feature")

    assert row["response_output_text"] == "answer"
    assert row["response_id"] == "resp-1"
    assert row["tools_called"] == "search_documents|ask_database"
    assert row["tool_call_count"] == 2
    # One FAILED call is visible even though the run itself did not raise —
    # the swallowed-failure hole this change closes.
    assert row["tool_error_count"] == 1
    assert row["error"] is None
