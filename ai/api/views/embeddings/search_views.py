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
from pgvector.django import L2Distance
from django.db.models.functions import Length


class SearchEmbeddingsAPIView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            message_data = request.data.get('message', None)
            document_name = request.data.get('document_name', None)

            model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

            embedding_message = model.encode([message_data])[0]

            closest_embeddings = Embeddings.objects.annotate(
                distance=L2Distance('embedding', embedding_message)
            ).order_by('distance')

            if document_name:
                closest_embeddings = closest_embeddings.filter(
                    name=document_name)

            results = [
                {
                    "name": obj.name,
                    "text": obj.text,
                    "chunk_number": obj.chunk_number,
                    "distance": obj.distance
                }
                for obj in closest_embeddings
            ]
            return Response({"message": results}, status=status.HTTP_200_OK)
        except Exception as e:

            print(f"An error occurred: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
