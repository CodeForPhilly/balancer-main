from django.http import JsonResponse
from sentence_transformers import SentenceTransformer
import json
import pinecone
import os
import openai

# XXX: remove csrf_exempt usage before production
from django.views.decorators.csrf import csrf_exempt


retriever = SentenceTransformer('flax-sentence-embeddings/all_datasets_v3_mpnet-base')

@csrf_exempt
def medication(request: str) -> JsonResponse:
    """
    Takes a query and uses drug review data to get
    reviews relevant to query. Passes that data to
    ChatGPT to summarize the relevant drug reviews.
    """
    pinecone_api_key = os.getenv("PINECONE_API_KEY")

    data = json.loads(request.body)

    if data is not None:
        drugReviewSearch = data["drugReviewSearch"]

    pinecone.init(
        api_key=pinecone_api_key,
        environment="asia-southeast1-gcp-free"
    )
    index = pinecone.Index("reviews-search")

    query = drugReviewSearch

    xq = retriever.encode([query]).tolist()

    xc = index.query(xq, top_k=10, include_metadata=True)

    results = []
    for context in xc['matches']:
        results.append(context['metadata'])

    openai.api_key = os.getenv('OPENAI_API_KEY')

    ai_response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": f"Can you give a summarization of each result based on the question. result: {results}  question: {drugReviewSearch}."}
        ]
    )

    if 'choices' in ai_response and ai_response['choices'] and 'message' in ai_response['choices'][0]:
        gpt_message = ai_response['choices'][0]['message']
    else:
        gpt_message = "No resposne from GPT or unexpected response format"
    
    response = {
        "gpt_message": gpt_message,
        "results": results
    }

    return JsonResponse(response, status=200)