import os

from sqlalchemy import create_engine
import anthropic
import evaluate
import pandas as pd

from server.api.views.text_extraction.views import USER_PROMPT
from server.api.views.text_extraction.views import anthropic_citations

rouge = evaluate.load('rouge')
bertscore = evaluate.load('bertscore')

def test_anthropic_citations(paper_name, chunks, user_prompt): # -> List[List]
    """
    """

    # texts, cited_texts, reference
    client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY"))

    texts, cited_texts = anthropic_citations(client, chunks, user_prompt)

    prediction = texts, cited_texts
    reference = 

    rouge1 = rouge.compute(predictions=[prediction], references=[reference])['rouge1']
    b = bertscore.compute(predictions=[prediction], references=[reference], model_type="microsoft/deberta-xlarge-mnli")
    
    return (paper_name, prediction, reference, rouge1, b['precision'][0], b['recall'][0], b['f1'][0])


engine = create_engine("postgresql+psycopg2://balancer:balancer@localhost:5433/balancer_dev")

query = "SELECT * FROM api_embeddings WHERE date_of_upload > '2025-03-14';"
df = pd.read_sql(query, engine)

evaluations = []
for paper_name in list(df['name'].unique()):
    chunks = [{"type": "text", "text": chunk} for chunk in df[df['name']==paper_name].sort_values('chunk_number')['text'].to_list()]

    evaluations.append(test_anthropic_citations(paper_name, chunks, USER_PROMPT))



pd.DataFrame.from_records(evaluations, columns = ['paper_name', 'prediction', 'reference', 'rouge1', 'bertscore_precision', 'bertscore_recall', 'bertscore_f1']).to_csv("/Users/sahildshah/Desktop/evals.csv")