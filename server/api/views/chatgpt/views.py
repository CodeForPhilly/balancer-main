from django.http import JsonResponse
from bs4 import BeautifulSoup
from nltk.stem import PorterStemmer
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.permissions import IsAuthenticated
import requests
import openai
import tiktoken
import os
import json


class ChatGPT(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Takes a diagnosis and returns a table of the most commonly prescribed medications for that diagnosis.
        """
        diagnosis = request.data.get("prompt")
        openai.api_key = os.environ.get("OPENAI_API_KEY")

        if diagnosis is not None:
            ai_response = openai.ChatCompletion.create(
                model="gpt-4",
                messages=[
                    {
                        "role": "system",
                        "content": f"Balancer is a powerful tool for selecting bipolar medication for patients. We are open-source and available for free use. Converstation: {diagnosis}.",
                    }
                ],
            )
            return Response({"message": ai_response}, status=status.HTTP_200_OK)
        else:
            return Response(
                {"error": "Failed to retrieve results from ChatGPT"},
                status=HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ExtractText(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """
        Takes a URL and returns a summary of page's text content.

        Currently only uses the first 3500 tokens.
        """
        openai.api_key = os.environ.get("OPENAI_API_KEY")
        webpage_url = request.data.get("webpage_url")

        response = requests.get(webpage_url)
        soup = BeautifulSoup(response.text, "html.parser")
        text_contents = soup.find_all("p")
        text_contents = [p.get_text() for p in text_contents]
        text_contents = " ".join(text_contents)

        stemmer = PorterStemmer()
        text_contents = text_contents.split()
        text_contents = [stemmer.stem(word) for word in text_contents]
        text_contents = " ".join(text_contents)

        tokens = get_tokens(text_contents, "cl100k_base")

        ai_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "Give a brief description of this medicine: %s" % tokens,
                }
            ],
            max_tokens=500,
        )

        return Response({"message": ai_response}, status=HTTP_200_OK)


def get_tokens(string, encoding_name):
    """Tokenize the first 3500 tokens of a string."""
    encoding = tiktoken.get_encoding(encoding_name)
    tokens = encoding.encode(string)
    tokens = tokens[:3500]
    output_string = encoding.decode(tokens)
    return output_string

class Diagnosis(APIView):
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def post(self, request):
        """Takes a diagnosis and returns a table of the most commonly prescribed medications for that diagnosis."""
        openai.api_key = os.environ.get("OPENAI_API_KEY")
        diagnosis = request.data.get("diagnosis")

        if diagnosis is not None:

            ai_response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[
                    {
                        "role": "system",
                        "content": """Please provide a table of the most commonly prescribed medications for %s. 
                        The table should be in HTML format, without any <head> tags. It should have a maximum width 
                        of 630px, with a margin of 0 for the top and bottom. The table should consist of two columns: 
                        'Medication Class' and 'Medication Names'. Each cell should have a left padding and a border, 
                        and the text in the 'Medication Class' and 'Medications' cells should be displayed in bold. 
                        No other cells should be bold."""
                        % diagnosis,
                    }
                ],
                max_tokens=4000,
            )

            response_data = {"message": ai_response}
            return Response(response_data, status=HTTP_200_OK)

        return Response({"error": "Invalid request"}, status=HTTP_400_BAD_REQUEST)
