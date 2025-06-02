"""
Evaluate LLM outputs using multiple metrics and compute associated costs
"""

#TODO: Add tests on a small dummy dataset to confirm it handles errors gracefully and produces expected outputs

import argparse
import logging

import evaluate
import pandas as pd

rouge = evaluate.load('rouge')
bertscore = evaluate.load('bertscore')

from services import ModelFactory

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def evaluate_response(model, query, context, reference):
    """
    """

    handler = ModelFactory.get_handler(model)

    #TODO: Add error handling for unsupported models
        
    text, token_usage, pricing, latency = handler.handle_request(query, context)

    rouge1 = rouge.compute(predictions=[text], references=[reference])['rouge1']

    # TODO: Read docs for the most apprpriate bertscore model to use
    b = bertscore.compute(predictions=[text], references=[reference], model_type="microsoft/deberta-xlarge-mnli")

    # TODO: Add METEOR scores: https://huggingface.co/spaces/evaluate-metric/meteor

    input_cost_dollars = (pricing['input'] / 1000000) * token_usage.input_tokens
    out_cost_dollars = (pricing['output'] / 1000000) * token_usage.output_tokens

    total_cost_dollars = input_cost_dollars + out_cost_dollars

    return pd.DataFrame([{
            "Output Text": text,
            "Rouge1": rouge1,
            "BertScore Precision": b['precision'][0],
            "BertScore Recall": b['recall'][0],
            "BertScore F1": b['f1'][0],
            "Total Cost (USD)": total_cost_dollars,
            "Latency (s)": latency
        }])


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Evaluate LLM outputs using multiple metrics and compute associated costs")
    parser.add_argument("--config", "-c", required=True, help="Path to config CSV file")
    parser.add_argument("--reference", "-r", required=True, help="Path to reference CSV file")
    parser.add_argument("--output", "-o", required=True, help="Path to output CSV file")

    args = parser.parse_args()

    df_config = pd.read_csv(args.config)
    logging.info(f"Config DataFrame shape: {df_config.shape}")
    logging.info(f"Config DataFrame columns: {df_config.columns.tolist()}")

    if not all(model in ModelFactory.HANDLERS.keys() for model in df_config['Model'].unique()):
        raise ValueError(f"Unsupported model(s) found in config: {set(df_config['Model'].unique()) - set(ModelFactory.HANDLERS.keys())}")
    
    df_reference = pd.read_csv(args.reference)
    logging.info(f"Reference DataFrame shape: {df_reference.shape}")
    logging.info(f"Reference DataFrame columns: {df_reference.columns.tolist()}")
    
    # Cross join the config and reference DataFrames
    df_in = df_config.merge(df_reference, how='cross')

    # TODO: Parallelize the evaluation process for each row in df_in using concurrent.futures or similar libraries
    df_evals = pd.DataFrame()
    for index, row in df_in.iterrows():

        df_evals = pd.concat([df_evals, evaluate_response(row['Model'], row['Query'], row['Context'], row['Reference'])], axis=0)
        
        logging.info(f"Processed row {index + 1}/{len(df_in)}")

    
    # Concatenate the input and evaluations DataFrames

    df_out = pd.concat([df_in.reset_index(drop=True), df_evals.reset_index(drop=True)], axis=1)

    df_out.to_csv(args.output, index=False)
    logging.info(f"Output DataFrame shape: {df_out.shape}")
    logging.info(f"Results saved to {args.output}")
    logging.info("Evaluation completed successfully.")