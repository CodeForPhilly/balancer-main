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
