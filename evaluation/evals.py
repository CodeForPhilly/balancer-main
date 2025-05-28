"""LLM Evals
"""

import os
import argparse
import logging

import anthropic
import evaluate
import pandas as pd
import openai

rouge = evaluate.load('rouge')
bertscore = evaluate.load('bertscore')

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

#TODO: Move this to a file and import it here and in server/api/views/text_extraction/views.py
def anthropic_citations(client, user_prompt, content_chunks): 
    """
    Function to interact with the Anthropic API to generate text with citations.
    Args:
        client (Anthropic): An instance of the Anthropic client.
        user_prompt (str): The user prompt to be sent to the model.
        content_chunks (list): A list of content chunks to be used as context for the model.
    Returns:
        tuple: A tuple containing the generated text, cited text, and message usage.
    Raises:
        Exception: If the API call fails or if the response format is unexpected.
    Example:
        >>> from anthropic import Anthropic
        >>> client = Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
        >>> user_prompt = "What is the capital of France?"
        >>> content_chunks = ["Paris is the capital of France.", "France is located in Europe."]    
    """

    message = client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "content",
                            "content": content_chunks
                        },
                        "citations": {"enabled": True}
                    },

                    {
                        "type": "text",
                        "text": user_prompt
                    }
                ]
            }
        ],
    )

    # Response Structure: https://docs.anthropic.com/en/docs/build-with-claude/citations#response-structure

    text = []
    cited_text = []
    for content in message.to_dict()['content']:
        text.append(content['text'])
        if 'citations' in content.keys():
            text.append(" ".join([f"<{citation['start_block_index']} - {citation['end_block_index']}>" for citation in content['citations']]))
            cited_text.append(" ".join([f"<{citation['start_block_index']} - {citation['end_block_index']}> {citation['cited_text']}" for citation in content['citations']]))

    texts = " ".join(text)
    cited_texts = " ".join(cited_text)

    return texts, message.usage


def openai_function(client, user_prompt, content_chunks):    
    """
    Function to interact with the OpenAI API to generate text.
    Args:
        client (OpenAI): An instance of the OpenAI client.
        user_prompt (str): The user prompt to be sent to the model.
        content_chunks (list): A list of content chunks to be used as context for the model.
    Returns:
        tuple: A tuple containing the generated text, cited text, and message usage.
    Raises:
        Exception: If the API call fails or if the response format is unexpected.
    Example:

    """

    response = client.responses.create(
        model="gpt-4o-mini",
        instructions=user_prompt,
        input=content_chunks,
    )


    return response.output_text, response.usage



def test_anthropic_citations(query: str, context: str, reference: str) -> tuple:
    """
    Test the anthropic_citations function with a given query and context.
    Args:
        query (str): The query string to be used in the test.
        context (str): The context string to be used in the test.
        reference (str): The reference string to be used in the test.
    Returns:
        tuple: A tuple containing the output and evaluation metrics.
    """

    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))
    texts, message_usage = anthropic_citations(client, query, context)

    # Evaluation Metrics

    rouge1 = rouge.compute(predictions=[texts], references=[reference])['rouge1']
    # TDOO: Read docs for the most apprpriate bertscore model to use
    b = bertscore.compute(predictions=[texts], references=[reference], model_type="microsoft/deberta-xlarge-mnli")
    # TODO: Add METEOR scores: https://huggingface.co/spaces/evaluate-metric/meteor

    # Model Pricing: https://docs.anthropic.com/en/docs/about-claude/pricing#model-pricing
    
    CLAUDE_HAIKU_3_5_PRICING_DOLLARS_PER_MILLION_TOKENS = {'base_input': 0.80, 
                                                           'output': 4.00,}


    input_cost_dollars = (CLAUDE_HAIKU_3_5_PRICING_DOLLARS_PER_MILLION_TOKENS['base_input'] / 1000000) * message_usage.input_tokens
    out_cost_dollars = (CLAUDE_HAIKU_3_5_PRICING_DOLLARS_PER_MILLION_TOKENS['output'] / 1000000) * message_usage.output_tokens

    total_cost_dollars = input_cost_dollars + out_cost_dollars

    return (texts, rouge1, b['precision'][0], b['recall'][0], b['f1'][0], total_cost_dollars)



def test_openai(query: str, context: str, reference: str) -> tuple:

    client = openai.OpenAI(api_key=os.environ.get("OPEN_API_KEY"))
    texts, usage = openai_function(client, query, context)

    rouge1 = rouge.compute(predictions=[texts], references=[reference])['rouge1']
    b = bertscore.compute(predictions=[texts], references=[reference], model_type="microsoft/deberta-xlarge-mnli")

    # Model Pricing: https://platform.openai.com/docs/pricing

    OPENAI_PRICING_DOLLARS_PER_MILLION_TOKENS = {'input': 0.15,
                                                'output': 0.60,}
    

    input_cost_dollars = (OPENAI_PRICING_DOLLARS_PER_MILLION_TOKENS['input'] / 1000000) * usage.input_tokens
    out_cost_dollars = (OPENAI_PRICING_DOLLARS_PER_MILLION_TOKENS['output'] / 1000000) * usage.output_tokens

    total_cost_dollars = input_cost_dollars + out_cost_dollars

    return (texts, rouge1, b['precision'][0], b['recall'][0], b['f1'][0], total_cost_dollars)



if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="LLM Evals")
    parser.add_argument("--config", "-c", required=True, help="Path to config CSV file")
    parser.add_argument("--reference", "-r", required=True, help="Path to reference CSV file")
    parser.add_argument("--output", "-o", required=True, help="Path to output CSV file")

    args = parser.parse_args()

    df_config = pd.read_csv(args.config)
    df_reference = pd.read_csv(args.reference)
    
    # Cross join the config and reference DataFrames
    df_in = df_config.merge(df_reference, how='cross')
    logging.info(f"Input DataFrame shape: {df_in.shape}")
    logging.info(f"Input DataFrame columns: {df_in.columns.tolist()}")
    
    # Ensure the input DataFrame has the required columns
    required_columns = ['Query', 'Context', 'Reference']
    if not all(col in df_in.columns for col in required_columns):
        raise ValueError(f"Input CSV must contain the following columns: {required_columns}")


    evaluations = []
    for index, row in df_in.iterrows():

        if row["Model"] == "CLAUDE_HAIKU_3_5_CITATIONS":
            evaluations.append(test_anthropic_citations(row['Query'], row['Context'], row['Reference']))
        elif row["Model"] == "OPEN_AI":
            evaluations.append(test_openai(row['Query'], row['Context'], row['Reference']))
        else:
            logging.warning(f"Model {row['MODEL']} is not supported or not implemented yet.")
            evaluations.append((None, None, None, None, None, None, None))

        logging.info(f"Processed row {index + 1}/{len(df_in)}")

    df = pd.DataFrame.from_records(evaluations, columns = ["Texts", "Rouge1", "BertScore Precision", "BertScore Recall", "BertScore F1", "Total Cost (USD)"])

    df_out = pd.concat([df_in, df], axis=1)

    df_out.to_csv(args.output, index=False)
    logging.info(f"Output DataFrame shape: {df_out.shape}")
    logging.info(f"Results saved to {args.output}")
    logging.info("Evaluation completed successfully.")