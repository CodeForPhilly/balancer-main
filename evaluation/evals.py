"""Evaluation script for testing the anthropic_citations function
"""

import os
import argparse

import anthropic
import evaluate
import pandas as pd

#from server.api.views.text_extraction.views import anthropic_citations

rouge = evaluate.load('rouge')
bertscore = evaluate.load('bertscore')

#TODO: Move this to a file and import it here and in server/api/views/text_extraction/views.py
def anthropic_citations(client, user_prompt, content_chunks): 
    """
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

    return texts, cited_texts, message.usage



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
    texts, cited_texts, message_usage = anthropic_citations(client, query, context)

    # Evaluation Metrics

    rouge1 = rouge.compute(predictions=[texts], references=[reference])['rouge1']
    # TDOO: Read docs for the most apprpriate bertscore model to use
    b = bertscore.compute(predictions=[texts], references=[reference], model_type="microsoft/deberta-xlarge-mnli")


    # Model Pricing: https://docs.anthropic.com/en/docs/about-claude/pricing#model-pricing
    
    CLAUDE_HAIKU_3_5_PRICING_DOLLARS_PER_MILLION_TOKENS = {'base_input': 0.80, 
                                                           'output': 4.00,}


    input_cost_dollars = (CLAUDE_HAIKU_3_5_PRICING_DOLLARS_PER_MILLION_TOKENS['base_input'] / 1000000) * message_usage.input_tokens
    out_cost_dollars = (CLAUDE_HAIKU_3_5_PRICING_DOLLARS_PER_MILLION_TOKENS['output'] / 1000000) * message_usage.output_tokens

    total_cost_dollars = input_cost_dollars + out_cost_dollars

    return ("CLAUDE_HAIKU_3_5", texts, cited_texts, rouge1, b['precision'][0], b['recall'][0], b['f1'][0], total_cost_dollars)


if __name__ == "__main__":

    parser = argparse.ArgumentParser(description="Evaluate anthropic_citations function on a dataset.")
    parser.add_argument("--input", "-i", required=True, help="Path to input CSV file")
    parser.add_argument("--output", "-o", required=True, help="Path to output CSV file")
    args = parser.parse_args()

    df_in = pd.read_csv(args.input)
    
    # Ensure the input DataFrame has the required columns
    required_columns = ['Query', 'Context', 'Reference']
    if not all(col in df_in.columns for col in required_columns):
        raise ValueError(f"Input CSV must contain the following columns: {required_columns}")

    #TODO: Strip and normalize column names in the DataFrame

    evaluations = []
    for index, row in df_in.iterrows():

        evaluations.append(test_anthropic_citations(row['Query'], row['Context'], row['Reference']))

    df = pd.DataFrame.from_records(evaluations, columns = ["Model", "Texts", "Cited Texts", "Rouge1", "BertScore Precision", "BertScore Recall", "BertScore F1", "Total Cost (USD)"])

    df_out = pd.concat([df_in, df], axis=1)

    df_out.to_csv(args.output, index=False)