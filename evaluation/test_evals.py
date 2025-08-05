#!/usr/bin/env -S uv run --script
# /// script
# requires-python = "==3.11.11"
# dependencies = [
#   "pandas==2.2.3",
#   "lighteval==0.10.0",
#   "openai==1.83.0",
#   "spacy==3.8.7",
#   "pytest==8.3.3",
#   "pytest-asyncio==0.24.0",
#   "pip"
# ]
# ///

import pytest
import pandas as pd
from unittest.mock import Mock, patch, AsyncMock
import tempfile
import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
from evaluation.evals import evaluate_response, calculate_cost_metrics, load_csv


@pytest.fixture
def mock_token_usage():
    token_usage = Mock()
    token_usage.input_tokens = 100
    token_usage.output_tokens = 50
    return token_usage


@pytest.fixture
def temp_csv():
    def _create_csv(content):
        with tempfile.NamedTemporaryFile(mode="w", suffix=".csv", delete=False) as f:
            f.write(content)
            return f.name

    return _create_csv


class TestCalculateCostMetrics:
    @pytest.mark.parametrize(
        "input_tokens,output_tokens,input_price,output_price,expected_input,expected_output,expected_total",
        [
            (1000, 500, 5.0, 15.0, 0.005, 0.0075, 0.0125),
            (0, 0, 5.0, 15.0, 0.0, 0.0, 0.0),
            (1_000_000, 2_000_000, 10.0, 30.0, 10.0, 60.0, 70.0),
        ],
    )
    def test_calculate_cost_metrics(
        self,
        input_tokens,
        output_tokens,
        input_price,
        output_price,
        expected_input,
        expected_output,
        expected_total,
    ):
        token_usage = Mock(input_tokens=input_tokens, output_tokens=output_tokens)
        pricing = {"input": input_price, "output": output_price}

        result = calculate_cost_metrics(token_usage, pricing)

        assert pytest.approx(result["input_cost"]) == expected_input
        assert pytest.approx(result["output_cost"]) == expected_output
        assert pytest.approx(result["total_cost"]) == expected_total


class TestLoadCsv:
    @pytest.mark.parametrize(
        "csv_content,required_columns,expected_len",
        [
            (
                "model,instructions\ngpt-4,Test prompt\ngpt-3.5,Another prompt\n",
                ["MODEL", "INSTRUCTIONS"],
                2,
            ),
            (
                " model , instructions \ngpt-4,Test prompt\n",
                ["MODEL", "INSTRUCTIONS"],
                1,
            ),
            ("input\nTest input 1\nTest input 2\n", ["INPUT"], 2),
        ],
    )
    def test_load_csv_valid(
        self, temp_csv, csv_content, required_columns, expected_len
    ):
        temp_path = temp_csv(csv_content)
        try:
            df = load_csv(temp_path, required_columns)
            assert len(df) == expected_len
            assert list(df.columns) == required_columns
        finally:
            os.unlink(temp_path)

    @pytest.mark.parametrize(
        "csv_content,required_columns",
        [
            ("model,prompt\ngpt-4,Test prompt\n", ["MODEL", "INSTRUCTIONS"]),
            ("wrong,columns\nval1,val2\n", ["MODEL", "INSTRUCTIONS"]),
        ],
    )
    def test_load_csv_missing_columns(self, temp_csv, csv_content, required_columns):
        temp_path = temp_csv(csv_content)
        try:
            with pytest.raises(ValueError, match="must contain the following columns"):
                load_csv(temp_path, required_columns)
        finally:
            os.unlink(temp_path)

    def test_load_csv_nonexistent_file(self):
        with pytest.raises(FileNotFoundError):
            load_csv("nonexistent_file.csv", ["MODEL"])


class TestEvaluateResponse:
    @pytest.mark.asyncio
    async def test_evaluate_response_success(self, mock_token_usage):
        mock_handler = AsyncMock()
        mock_handler.handle_request.return_value = (
            "Generated response text",
            mock_token_usage,
            {"input": 5.0, "output": 15.0},
            1.5,
        )

        mock_extractiveness = Mock()
        mock_extractiveness.compute.return_value = {
            "summarization_coverage": 0.8,
            "summarization_density": 0.6,
            "summarization_compression": 0.4,
        }

        with (
            patch(
                "evaluation.evals.ModelFactory.get_handler", return_value=mock_handler
            ),
            patch("evaluation.evals.Extractiveness", return_value=mock_extractiveness),
        ):
            result = await evaluate_response("gpt-4", "Test instructions", "Test input")

            assert isinstance(result, pd.DataFrame)
            assert len(result) == 1
            row = result.iloc[0]
            assert row["Generated Text"] == "Generated response text"
            assert row["Extractiveness Coverage"] == 0.8
            assert row["Input Token Usage"] == 100
            assert row["Output Token Usage"] == 50
            assert row["Duration (s)"] == 1.5

    @pytest.mark.parametrize(
        "exception_side_effect", ["get_handler", "handle_request", "extractiveness"]
    )
    @pytest.mark.asyncio
    async def test_evaluate_response_exceptions(
        self, mock_token_usage, exception_side_effect
    ):
        if exception_side_effect == "get_handler":
            with patch(
                "evaluation.evals.ModelFactory.get_handler",
                side_effect=Exception("Test error"),
            ):
                result = await evaluate_response(
                    "invalid-model", "Test instructions", "Test input"
                )

        elif exception_side_effect == "handle_request":
            mock_handler = AsyncMock()
            mock_handler.handle_request.side_effect = Exception("Handler error")
            with patch(
                "evaluation.evals.ModelFactory.get_handler", return_value=mock_handler
            ):
                result = await evaluate_response(
                    "gpt-4", "Test instructions", "Test input"
                )

        elif exception_side_effect == "extractiveness":
            mock_handler = AsyncMock()
            mock_handler.handle_request.return_value = (
                "text",
                mock_token_usage,
                {"input": 5.0, "output": 15.0},
                1.5,
            )
            mock_extractiveness = Mock()
            mock_extractiveness.compute.side_effect = Exception("Extractiveness error")

            with (
                patch(
                    "evaluation.evals.ModelFactory.get_handler",
                    return_value=mock_handler,
                ),
                patch(
                    "evaluation.evals.Extractiveness", return_value=mock_extractiveness
                ),
            ):
                result = await evaluate_response(
                    "gpt-4", "Test instructions", "Test input"
                )

        assert isinstance(result, pd.DataFrame)
        assert len(result) == 1
        assert pd.isna(result.iloc[0]["Generated Text"])


if __name__ == "__main__":
    pytest.main([__file__])
