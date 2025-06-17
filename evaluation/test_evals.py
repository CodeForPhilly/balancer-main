
from unittest.mock import patch, MagicMock

import pytest
import pandas as pd

from evals import evaluate_response  

class MockTokenUsage:
    def __init__(self, input_tokens, output_tokens):
        self.input_tokens = input_tokens
        self.output_tokens = output_tokens

@patch("evals.ModelFactory.get_handler")
@patch("evals.Extractiveness.compute")
def test_evaluate_response(mock_extractiveness_compute, mock_get_handler):

    # Mock BaseModelHandler
    mock_handler = MagicMock()
    mock_handler.handle_request.return_value = (
        "This is a summary.",
        MockTokenUsage(input_tokens=100, output_tokens=50),
        {"input": 15.0, "output": 30.0},  # $15 and $30 per 1M tokens
        1.23,  # duration
    )

    mock_get_handler.return_value = mock_handler

    mock_extractiveness_compute.return_value = {
        "summarization_coverage": 0.8,
        "summarization_density": 1.5,
        "summarization_compression": 2.0,
    }

    df = evaluate_response(
        model_name="mock-model",
        query="What is the summary?",
        context="This is a long article about something important.",
        reference="This is a reference summary.",
    )

    assert isinstance(df, pd.DataFrame)
    assert df.shape == (1, 8)
    assert df["Output Text"].iloc[0] == "This is a summary."
    assert df["Extractiveness Coverage"].iloc[0] == 0.8
    assert df["Extractiveness Density"].iloc[0] == 1.5
    assert df["Extractiveness Compression"].iloc[0] == 2.0
    assert df["Input Token Usage"].iloc[0] == 100
    assert df["Output Token Usage"].iloc[0] == 50

    expected_cost = (15.0 / 1_000_000) * 100 + (30.0 / 1_000_000) * 50
    assert pytest.approx(df["Cost (USD)"].iloc[0], rel=1e-4) == expected_cost
    assert pytest.approx(df["Duration (s)"].iloc[0], rel=1e-4) == 1.23