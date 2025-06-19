"""
Evaluate LLM outputs using multiple metrics and compute associated costs
"""

#TODO: Run this script with uv to manage dependencies

# TODO: Add tests on a small dummy dataset to confirm it handles errors gracefully and produces expected outputs

import sys
import os

# Ensure the parent directory is in the path to import ModelFactory
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

import argparse
import logging

import pandas as pd
from lighteval.tasks.requests import Doc
from lighteval.metrics.metrics_sample import Extractiveness

from server.api.services.llm_services import ModelFactory

logging.basicConfig(
    level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s"
)


def evaluate_response(
    model_name: str, query: str, context: str
) -> pd.DataFrame:
    """
    Evaluates the response of a model to a given query and context, computes extractiveness metrics, token usage, and cost

    Args:
        model_name (str): The name of the model to be used for evaluation.
        query (str): The user query to be processed.
        context (str): The context or document content to be used.
        reference (str): The reference text for comparison (not used in this function, but can be used for further evaluations).

    Returns:
        pd.DataFrame: A DataFrame containing the output text, extractiveness metrics, token usage, cost, and duration.
    """

    handler = ModelFactory.get_handler(model_name)

    # TODO: Add error handling for unsupported models

    output_text, token_usage, pricing, duration = handler.handle_request(query, context)

    doc = Doc(query="", choices=[], gold_index=0, specific={"text": context})
    extractiveness = Extractiveness().compute(
        formatted_doc=doc, predictions=[output_text]
    )

    input_cost_dollars = (pricing["input"] / 1000000) * token_usage.input_tokens
    output_cost_dollars = (pricing["output"] / 1000000) * token_usage.output_tokens

    total_cost_dollars = input_cost_dollars + output_cost_dollars

    return pd.DataFrame(
        [
            {
                "Output Text": output_text,
                "Extractiveness Coverage": extractiveness["summarization_coverage"],
                "Extractiveness Density": extractiveness["summarization_density"],
                "Extractiveness Compression": extractiveness[
                    "summarization_compression"
                ],
                "Input Token Usage": token_usage.input_tokens,
                "Output Token Usage": token_usage.output_tokens,
                "Cost (USD)": total_cost_dollars,
                "Duration (s)": duration,
            }
        ]
    )


if __name__ == "__main__":
    # TODO: Add CLI argument to specify the metrics to be computed
    parser = argparse.ArgumentParser(
        description="Evaluate LLM outputs using multiple metrics and compute associated costs"
    )
    parser.add_argument("--config", "-c", required=True, help="Path to config CSV file")
    parser.add_argument(
        "--reference", "-r", required=True, help="Path to reference CSV file"
    )
    parser.add_argument("--output", "-o", required=True, help="Path to output CSV file")

    args = parser.parse_args()

    df_config = pd.read_csv(args.config)
    logging.info(f"Config DataFrame shape: {df_config.shape}")
    logging.info(f"Config DataFrame columns: {df_config.columns.tolist()}")

    # Remove the trailing whitespace from column names
    df_config.columns = df_config.columns.str.strip()

    # Check if the required columns are present
    # TODO: Make this more flexible by allowing the user to use default instructions
    required_columns = ["Model Name", "Query"]
    if not all(col in df_config.columns for col in required_columns):
        raise ValueError(
            f"Config DataFrame must contain the following columns: {required_columns}"
        )

    # Check if all models in the config are supported by ModelFactory
    if not all(
        model in ModelFactory.HANDLERS.keys()
        for model in df_config["Model Name"].unique()
    ):
        raise ValueError(
            f"Unsupported model(s) found in config: {set(df_config['Model Name'].unique()) - set(ModelFactory.HANDLERS.keys())}"
        )

    df_reference = pd.read_csv(args.reference)
    logging.info(f"Reference DataFrame shape: {df_reference.shape}")
    logging.info(f"Reference DataFrame columns: {df_reference.columns.tolist()}")

    # Remove the trailing whitespace from column names
    df_reference.columns = df_reference.columns.str.strip()
    # Check if the required columns are present
    required_columns = ["Context"]
    if not all(col in df_reference.columns for col in required_columns):
        raise ValueError(
            f"Reference DataFrame must contain the following columns: {required_columns}"
        )

    # Cross join the config and reference DataFrames
    df_in = df_config.merge(df_reference, how="cross")

    # TODO: Parallelize the evaluation process for each row in df_in using concurrent.futures or similar libraries
    df_evals = pd.DataFrame()
    for index, row in df_in.iterrows():
        df_evals = pd.concat(
            [
                df_evals,
                evaluate_response(
                    row["Model Name"], row["Query"], row["Context"]
                ),
            ],
            axis=0,
        )

        logging.info(f"Processed row {index + 1}/{len(df_in)}")

    # Concatenate the input and evaluations DataFrames

    df_out = pd.concat(
        [df_in.reset_index(drop=True), df_evals.reset_index(drop=True)], axis=1
    )

    df_out.to_csv(args.output, index=False)
    logging.info(f"Output DataFrame shape: {df_out.shape}")
    logging.info(f"Results saved to {args.output}")
    logging.info("Evaluation completed successfully.")
