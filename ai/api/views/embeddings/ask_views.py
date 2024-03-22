from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import openai
from .models import Embeddings
from pgvector.django import L2Distance
from sentence_transformers import SentenceTransformer
import os


class AskEmbeddingsAPIView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            message_data = request.data.get('message', None)
            if not message_data:
                return Response({"error": "Message data is required."}, status=status.HTTP_400_BAD_REQUEST)

            model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
            embedding_message = model.encode([message_data])[0]

            closest_embeddings = Embeddings.objects.annotate(
                distance=L2Distance('embedding', embedding_message)
            ).order_by('distance')[:10]

            if not closest_embeddings.exists():
                return Response({"error": "No matching documents found."}, status=status.HTTP_404_NOT_FOUND)

            embeddings_info = [
                {"name": obj.name, "text": obj.text,
                    "chunk_number": obj.chunk_number}
                for obj in closest_embeddings
            ]

            prompt_texts = [
                f"Document: {obj['name']}, Text: {obj['text']}" for obj in embeddings_info]

            formatted_prompt = f"Question: {message_data}\n\n" + \
                "\n\n".join(prompt_texts)

            openai.api_key = os.getenv("OPENAI_API_KEY")
            response = openai.ChatCompletion.create(
                model="gpt-4",
                temperature=0.7,
                max_tokens=500,
                messages=[
                    {"role": "system",
                        "content": "Only answer the question from content below. and give a detail expatiation for the answer and list out the documents used at the end of the answer."},
                    {"role": "user", "content": formatted_prompt}
                ]
            )

            answer = response["choices"][0]["message"]["content"]

            return Response({
                "question": message_data,
                "llm_response": answer,
                "embeddings_info": embeddings_info,
                "sent to LLM": formatted_prompt
            }, status=status.HTTP_200_OK)

        except Exception as e:
            print(f"An error occurred: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
