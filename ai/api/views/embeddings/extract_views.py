from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from langchain.vectorstores.pgvector import PGVector
from sentence_transformers import SentenceTransformer
import fitz
from langchain.text_splitter import RecursiveCharacterTextSplitter
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from pathlib import Path
from .models import Embeddings


class ExtractEmbeddingsAPIView(APIView):
    def post(self, request, *args, **kwargs):
        try:

            model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
            # embeddings = OpenAIEmbeddings()
            # vector = embeddings.embed_query('Testing the embedding model')

            message_data = request.data.get('message', None)
            if message_data is None:
                return Response({"error": "No message provided."}, status=status.HTTP_400_BAD_REQUEST)

            embedding = model.encode([message_data])

            # Return the embedding. Note: embedding is a numpy array so it needs to be converted to a list to be JSON serializable
            return Response({"message": message_data, "embeddings": embedding.tolist()}, status=status.HTTP_200_OK)
        except Exception as e:
            # Print the error and return a response indicating an internal server error
            print(f"An error occurred: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
