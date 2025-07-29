#!/usr/bin/env -S uv run --script
# /// script
# requires-python = "==3.11.11"
# dependencies = [
#   "pandas==2.2.3",
#   "lighteval==0.10.0",
#   "openai==1.83.0",
#   "spacy==3.8.7",
#   "pip"
#
# ]
# ///

"""
Evaluate LLM outputs using multiple metrics and compute associated costs
"""

import sys
import os

# Ensure the parent directory is in the path to import ModelFactory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import argparse
import logging
import asyncio
import time

import pandas as pd

# lighteval depends on `sentencepiece` and it only has prebuilt wheels for Python 3.11 or below
from lighteval.tasks.requests import Doc
from lighteval.metrics.metrics_sample import Extractiveness

from server.api.services.llm_services import ModelFactory

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


async def evaluate_response(model: str, instructions: str, input: str) -> pd.DataFrame:
    """
    Test a prompt with a set of test data by scoring each item in the data set
    """

    try:
        handler = ModelFactory.get_handler(model)

        generated_text, token_usage, pricing, duration = await handler.handle_request(
            instructions, input
        )

        doc = Doc(query="", choices=[], gold_index=0, specific={"text": input})
        extractiveness = Extractiveness().compute(
            formatted_doc=doc, predictions=[generated_text]
        )

        cost_metrics = calculate_cost_metrics(token_usage, pricing)

        result = pd.DataFrame(
            [
                {
                    "Generated Text": generated_text,
                    "Extractiveness Coverage": extractiveness["summarization_coverage"],
                    "Extractiveness Density": extractiveness["summarization_density"],
                    "Extractiveness Compression": extractiveness[
                        "summarization_compression"
                    ],
                    "Input Token Usage": token_usage.input_tokens,
                    "Output Token Usage": token_usage.output_tokens,
                    "Cost (USD)": cost_metrics["total_cost"],
                    "Duration (s)": duration,
                }
            ]
        )

    except Exception as e:
        logging.error(f"Error evaluating response for model {model}: {e}")
        result = pd.DataFrame(
            [
                {
                    "Generated Text": None,
                    "Extractiveness Coverage": None,
                    "Extractiveness Density": None,
                    "Extractiveness Compression": None,
                    "Input Token Usage": None,
                    "Output Token Usage": None,
                    "Cost (USD)": None,
                    "Duration (s)": None,
                }
            ]
        )

    return result


def calculate_cost_metrics(token_usage: dict, pricing: dict) -> dict:
    """
    Calculate cost metrics based on token usage and pricing
    """

    TOKENS_PER_MILLION = 1_000_000

    # Pricing is in dollars per million tokens
    input_cost_dollars = (
        pricing["input"] / TOKENS_PER_MILLION
    ) * token_usage.input_tokens
    output_cost_dollars = (
        pricing["output"] / TOKENS_PER_MILLION
    ) * token_usage.output_tokens
    total_cost_dollars = input_cost_dollars + output_cost_dollars

    return {
        "input_cost": input_cost_dollars,
        "output_cost": output_cost_dollars,
        "total_cost": total_cost_dollars,
    }


def load_csv(file_path: str, required_columns: list, nrows: int = None) -> pd.DataFrame:
    """
    Load a CSV file and validate that it contains the required columns

    Args:
        file_path (str): Path to the CSV file
        required_columns (list): List of required column names
        nrows (int): Number of rows to read from the CSV file
    Returns:
        pd.DataFrame
    """

    if nrows is not None:
        logging.info(f"Test mode enabled: Reading first {nrows} rows of {file_path}")

    df = pd.read_csv(file_path, nrows=nrows)

    # Remove trailing whitespace from column names
    df.columns = df.columns.str.strip()

    # Uppercase the column names to match the expected format
    df.columns = df.columns.str.upper()

    # Check if the required columns are present
    if not all(col in df.columns for col in required_columns):
        raise ValueError(
            f"{file_path} must contain the following columns: {required_columns}"
        )

    return df


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--experiments", "-e", required=True, help="Path to experiments CSV file"
    )
    parser.add_argument(
        "--dataset", "-d", required=True, help="Path to dataset CSV file"
    )
    parser.add_argument(
        "--results", "-r", required=True, help="Path to results CSV file"
    )
    parser.add_argument(
        "--test", "-t", type=int, help="Run evaluation on first n rows of dataset only"
    )

    args = parser.parse_args()

    # Load the experiment DataFrame
    df_experiment = load_csv(
        args.experiments, required_columns=["MODEL", "INSTRUCTIONS"]
    )

    # Load the dataset DataFrame
    df_dataset = load_csv(args.dataset, required_columns=["INPUT"], nrows=args.test)

    # Bulk model and prompt experimentation: Cross join the experiment and dataset DataFrames
    df_in = df_experiment.merge(df_dataset, how="cross")

    # Evaluate each row in the input DataFrame concurrently
    logging.info(f"Starting evaluation of {len(df_in)} rows")
    start_time = time.time()
    tasks = [
        evaluate_response(row.MODEL, row.INSTRUCTIONS, row.INPUT)
        for row in df_in.itertuples(index=False)
    ]

    results = await asyncio.gather(*tasks)
    end_time = time.time()
    duration = end_time - start_time
    logging.info(f"Completed evaluation of {len(results)} rows in {duration} seconds")

    df_evals = pd.concat(results, axis=0, ignore_index=True)

    # Concatenate the input and evaluations DataFrames
    df_out = pd.concat(
        [df_in.reset_index(drop=True), df_evals.reset_index(drop=True)], axis=1
    )
    df_out.to_csv(args.results, index=False)
    logging.info(f"Results saved to {args.results}")
    logging.info("Evaluation completed successfully.")


if __name__ == "__main__":
    asyncio.run(main())
