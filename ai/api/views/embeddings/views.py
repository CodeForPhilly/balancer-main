from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
import openai
import os
import json


class ExtractEmbeddingsAPIView(APIView):
    """
    Takes a diagnosis and returns a table of the most commonly prescribed medications for that diagnosis.
    """

    def post(self, request, *args, **kwargs):
        openai.api_key = os.environ.get("OPENAI_API_KEY")
        data = request.data

        if 'prompt' in data:
            diagnosis = data["prompt"]
            try:
                ai_response = openai.ChatCompletion.create(
                    model="gpt-4",
                    messages=[
                        {"role": "system", "content": f"Balancer is a powerful tool for selecting bipolar medication for patients. We are open-source and available for free use. Conversation: {diagnosis}."}
                    ]
                )
                return Response({"message": ai_response})
            except Exception as e:
                return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"error": "Prompt is required."}, status=status.HTTP_400_BAD_REQUEST)
