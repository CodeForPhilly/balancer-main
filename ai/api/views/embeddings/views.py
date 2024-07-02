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


class StoreEmbeddingsAPIView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            pdf_file = request.FILES.get('file', None)
            if pdf_file is None:
                return Response({"error": "No PDF file provided."}, status=status.HTTP_400_BAD_REQUEST)

            file_name = Path(pdf_file.name).stem

            doc = fitz.open(stream=pdf_file.read(), filetype="pdf")

            text = ""
            for page in doc:
                text += page.get_text()

            doc.close()

            model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

            words = text.split()
            chunks = [' '.join(words[i:i+50])
                      for i in range(0, len(words), 50)]

            embeddings = model.encode(chunks)

            chunks_data = []
            for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                # Create an Embeddings object for each chunk and save to database
                embedding_instance = Embeddings(
                    name=file_name,
                    text=chunk,
                    chunk_number=i,
                    # Assuming your VectorField can handle list input directly
                    embedding=embedding.tolist()
                )
                embedding_instance.save()

                # Optionally, append information to chunks_data for the response
                chunks_data.append({
                    "index": i,
                    "file_name": file_name,
                    "chunk": chunk,
                    "embedding": embedding.tolist()
                })
            # Constructing the response with chunk, index, and its embedding
            # chunks_data = [
            #     {"index": i, "file name": file_name,
            #         "chunk": chunk, "embedding": embedding.tolist()}
            #     for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
            # ]

            return Response({'chunks_data': chunks_data}, status=status.HTTP_200_OK)
        except Exception as e:
            # Print the error and return a response indicating an internal server error
            print(f"An error occurred: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# class StoreEmbeddingsAPIView(APIView):
#     def post(self, request, *args, **kwargs):
#         try:
#             pdf_file = request.FILES.get('file', None)
#             if pdf_file is None:
#                 return Response({"error": "No PDF file provided."}, status=status.HTTP_400_BAD_REQUEST)

#             pdf_content = pdf_file.read()
#             pdf_file.seek(0)
#             temp_file_path = default_storage.save(
#                 "temp_uploaded.pdf", ContentFile(pdf_content))

#             print("test10s")
#             # Now that the file is saved, you can use a file path based loader
#             loader = PyPDFLoader(temp_file_path)
#             documents = loader.load()
#             # full_text = ""
#             # for page in doc:
#             #     full_text += page.get_text()
#             # print(full_text)
#             text_splitter = RecursiveCharacterTextSplitter(
#                 chunk_size=1000, chunk_overlap=20)
#             print("test1sss0s")
#             print(len(documents))
#             texts = text_splitter.split_documents(documents)
#             print(text_splitter)
#             print(texts[0])
#             model = SentenceTransformer('paraphrase-MiniLM-L6-v2')
#             print("test1")
#             # # Extract the message from the request body
#             # message_data = request.data.get('message', None)
#             # if message_data is None:
#             #     return Response({"error": "No message provided."}, status=status.HTTP_400_BAD_REQUEST)
#             print("test2")
#             CONNECTION_STRING = "postgresql+psycopg2://balancer:balancer@db:5432/balancer_dev"
#             COLLECTION_NAME = 'state_of_union_vecasdtdors'
#             # embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
#             embeddings = OpenAIEmbeddings()
#             # embedding = model.encode([message_data])
#             print("test3")
#             db = PGVector.from_documents(
#                 embedding=embeddings,
#                 documents=texts,
#                 collection_name=COLLECTION_NAME,
#                 connection_string=CONNECTION_STRING,
#             )
#             print("test33")

#             # Return the embedding. Note: embedding is a numpy array so it needs to be converted to a list to be JSON serializable
#             return Response("embeddings", status=status.HTTP_200_OK)
#         except Exception as e:
#             # Print the error and return a response indicating an internal server error
#             print(f"An error occurred: {e}")
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
