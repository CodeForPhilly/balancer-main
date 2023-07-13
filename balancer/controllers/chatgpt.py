from django.http import JsonResponse
from bs4 import BeautifulSoup
from nltk.stem import PorterStemmer
import requests
import openai
import tiktoken
import os
import json

# remove before production
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def extract_webpage(request):
    openai.api_key = os.getenv('OPENAI_API_KEY')
    data = json.loads(request.body)
    webpage_url = data['webpage_url']
    print(webpage_url)

    response = requests.get(webpage_url)
    soup = BeautifulSoup(response.text, 'html.parser')
    text_contents = soup.find_all('p')
    text_contents = [p.get_text() for p in text_contents]
    text_contents = ' '.join(text_contents)

    stemmer = PorterStemmer()
    text_contents = text_contents.split()
    text_contents = [stemmer.stem(word) for word in text_contents]
    text_contents = ' '.join(text_contents)
    print(text_contents)

    tokens = get_tokens(text_contents, "cl100k_base")

    ai_response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Give a brief description of this medicine: %s" % tokens, }],
        max_tokens=500,
    )

    return JsonResponse({'message': ai_response})


def get_tokens(string: str, encoding_name: str) -> str:
    encoding = tiktoken.get_encoding(encoding_name)
    tokens = encoding.encode(string)
    tokens = tokens[:3500]
    output_string = encoding.decode(tokens)
    return output_string
