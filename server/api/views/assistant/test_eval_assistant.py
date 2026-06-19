from unittest.mock import MagicMock, patch


# ---------------------------------------------------------------------------
# run_one tests
#
# run_one wraps run_assistant and shapes its output into a result row for the
# eval CSV. We patch run_assistant (no live OpenAI, no DB) and check that both
# the success and error paths produce a well-formed row.
# ---------------------------------------------------------------------------

@patch("api.views.assistant.eval_assistant.run_assistant")
def test_run_one_returns_result_row_on_success(mock_run_assistant):
    mock_run_assistant.return_value = ("answer", "resp-1")

    from api.views.assistant.eval_assistant import run_one

    row = run_one("What is lithium?", user=MagicMock(), branch="develop")

    assert row["branch"] == "develop"
    assert row["question"] == "What is lithium?"
    assert row["response_output_text"] == "answer"
    assert row["error"] is None


@patch("api.views.assistant.eval_assistant.run_assistant", side_effect=Exception("boom"))
def test_run_one_captures_error(mock_run_assistant):
    from api.views.assistant.eval_assistant import run_one

    row = run_one("query", user=MagicMock(), branch="feature")

    assert row["branch"] == "feature"
    assert row["response_output_text"] is None
    assert "boom" in row["error"]
