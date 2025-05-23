"""Evaluation script for testing the anthropic_citations function
"""

import os

import anthropic
import evaluate
import pandas as pd

#from server.api.views.text_extraction.views import anthropic_citations

rouge = evaluate.load('rouge')
bertscore = evaluate.load('bertscore')

#TODO: Move this to a file and import it here in evaluation/evals.py and server/api/views/text_extraction/views.py
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

    return texts, cited_texts



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
    texts, cited_texts = anthropic_citations(client, query, context)

    rouge1 = rouge.compute(predictions=[texts], references=[reference])['rouge1']
    b = bertscore.compute(predictions=[texts], references=[reference], model_type="microsoft/deberta-xlarge-mnli")

    return (texts, cited_texts, rouge1, b['precision'][0], b['recall'][0], b['f1'][0])


if __name__ == "__main__":

    #TODO: Add command line arguments for input and output file paths
    df_in = pd.read_csv("")

    #TODO: Strip and normalize column names in the DataFrame:

    evaluations = []
    for index, row in df_in.iterrows():

        evaluations.append(test_anthropic_citations(row['Query'], row['Context'], row['Reference']))

    df = pd.DataFrame.from_records(evaluations, columns = ["Texts", "Cited Texts", "Rouge1", "BertScore Precision", "BertScore Recall", "BertScore F1"])

    df_out = pd.concat([df_in, df], axis=1).to_csv("", index=False)