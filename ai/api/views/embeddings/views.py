from django.http import JsonResponse
from bs4 import BeautifulSoup
from nltk.stem import PorterStemmer
import requests
import openai
import tiktoken
import os
import json

# XXX: remove csrf_exempt usage before production
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def extract_embeddings(request: str) -> JsonResponse:
    """
    Takes a diagnosis and returns a table of the most commonly prescribed medications for that diagnosis.
    """
    openai.api_key = os.environ.get("OPENAI_API_KEY")
    data: dict[str, str] = json.loads(request.body)

    if data is not None:
        diagnosis: str = data["prompt"]
        ai_response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"Balancer is a powerful tool for selecting bipolar medication for patients. We are open-source and available for free use. Converstation: {diagnosis}."}
            ]
        )
        return JsonResponse({"message": ai_response})

    return JsonResponse({"error": "Failed to retrieve results from ChatGPT."})
