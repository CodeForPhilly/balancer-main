from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from langchain.vectorstores.pgvector import PGVector
from sentence_transformers import SentenceTransformer


class ExtractEmbeddingsAPIView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # Load the model - consider moving this outside the request handling
            # to load it only once if performance is an issue.
            model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

            # Extract the message from the request body
            message_data = request.data.get('message', None)
            if message_data is None:
                return Response({"error": "No message provided."}, status=status.HTTP_400_BAD_REQUEST)

            # Encode the message to get the embeddings
            # Make sure it's a list even for a single sentence
            embedding = model.encode([message_data])

            # Return the embedding. Note: embedding is a numpy array so it needs to be converted to a list to be JSON serializable
            return Response({"embeddings": embedding.tolist()}, status=status.HTTP_200_OK)
        except Exception as e:
            # Print the error and return a response indicating an internal server error
            print(f"An error occurred: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class StoreEmbeddingsAPIView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            # Load the model - consider moving this outside the request handling
            # to load it only once if performance is an issue.
            model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

            # Extract the message from the request body
            message_data = request.data.get('message', None)
            if message_data is None:
                return Response({"error": "No message provided."}, status=status.HTTP_400_BAD_REQUEST)

            # Encode the message to get the embeddings
            # Make sure it's a list even for a single sentence
            embedding = model.encode([message_data])

            # Return the embedding. Note: embedding is a numpy array so it needs to be converted to a list to be JSON serializable
            return Response({"embeddings": embedding.tolist()}, status=status.HTTP_200_OK)
        except Exception as e:
            # Print the error and return a response indicating an internal server error
            print(f"An error occurred: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
