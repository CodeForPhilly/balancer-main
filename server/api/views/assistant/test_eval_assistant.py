# Tests for run_one (eval_assistant.py): the helper that runs the assistant for a
# single eval question and shapes the outcome into a result row.
#
# run_assistant is mocked, so this covers the logic run_one owns — the try/except
# that turns a raising question into an error row instead of aborting the batch, the
# tool columns derived from AssistantResult.tool_calls, and the invariant that both
# paths emit every CSV column.

from unittest.mock import MagicMock, patch

import pytest

from api.views.assistant.assistant_types import AssistantResult, ToolCall, ToolCallStatus
from api.views.assistant.eval_assistant import FIELDNAMES, run_one

# TODO: add coverage for main()'s CSV output.

# The two run_assistant outcomes, as patch() kwargs so the same pair can drive both
# the per-path tests and the shared column invariant without restating either setup.
_SUCCEEDS = {
    "return_value": AssistantResult(
        output_text="answer",
        response_id="resp-1",
        tool_calls=[
            ToolCall(
                name="search_documents",
                status=ToolCallStatus.OK,
                arguments={"query": "lithium"},
                output="docs",
            ),
            ToolCall(
                name="ask_database",
                status=ToolCallStatus.FAILED,
                arguments={"query": "SELECT"},
                error="bad sql",
            ),
        ],
    )
}
_RAISES = {"side_effect": Exception("boom")}


@pytest.mark.parametrize(
    "run_assistant_behavior",
    [pytest.param(_SUCCEEDS, id="success-row"), pytest.param(_RAISES, id="error-row")],
)
def test_run_one_row_carries_every_csv_column(run_assistant_behavior):
    """One invariant over both code paths, so it is parametrized rather than restated.

    This is the only guard on it. csv.DictWriter raises on an *extra* key
    (extrasaction="raise"), which is the direction the FIELDNAMES comment describes —
    but a *missing* key is silently filled with restval (""). So a column added to
    one row literal in run_one and forgotten in the other reaches the CSV as an empty
    cell rather than an error, which is precisely the ragged-row failure FIELDNAMES
    was introduced to prevent.
    """
    with patch(
        "api.views.assistant.eval_assistant.run_assistant", **run_assistant_behavior
    ):
        row = run_one("query", user=MagicMock(), branch="feature")

    assert set(row) == set(FIELDNAMES)


@patch("api.views.assistant.eval_assistant.run_assistant", **_RAISES)
def test_run_one_captures_error(mock_run_assistant):
    row = run_one("query", user=MagicMock(), branch="feature")

    assert row["branch"] == "feature"
    assert row["response_output_text"] is None
    assert "boom" in row["error"]
    # The error row *defaults* the tool columns rather than omitting them, and still
    # records time-to-failure. That the columns are present at all is asserted above;
    # these are their values.
    assert row["tools_called"] == ""
    assert row["tool_call_count"] == 0
    assert row["tool_error_count"] == 0
    assert row["tool_calls_json"] is None
    assert row["duration_s"] > 0


@patch("api.views.assistant.eval_assistant.run_assistant", **_SUCCEEDS)
def test_run_one_records_tool_calls(mock_run_assistant):
    row = run_one("query", user=MagicMock(), branch="feature")

    assert row["tools_called"] == "search_documents|ask_database"
    assert row["tool_call_count"] == 2
    # tool_error_count counts every non-OK status, so one FAILED call stays visible
    # even though the run itself did not raise and `error` is None. That combination
    # is the swallowed-failure hole this column exists to close — a run that reads
    # clean at the row level while a retrieval underneath it broke.
    assert row["tool_error_count"] == 1
    assert row["error"] is None
