from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from langchain.vectorstores.pgvector import PGVector
from sentence_transformers import SentenceTransformer
import fitz
from langchain.text_splitter import RecursiveCharacterTextSplitter
from django.core.files.base import ContentFile
from pathlib import Path
from .models import Embeddings
from django.db.models import Count


class ManageEmbeddingsAPIView(APIView):
    def post(self, request, *args, **kwargs):
        try:
            pdf_files = request.FILES.getlist('files')
            if not pdf_files:
                return Response({"error": "No PDF files provided."}, status=status.HTTP_400_BAD_REQUEST)

            all_files_data = []
            rejected_files = []

            for pdf_file in pdf_files:
                file_name = Path(pdf_file.name).stem

                if Embeddings.objects.filter(name=file_name).exists():
                    rejected_files.append(pdf_file.name)
                    continue

                doc = fitz.open(stream=pdf_file.read(), filetype="pdf")

                text = ""
                for page in doc:
                    text += page.get_text()
                doc.close()

                model = SentenceTransformer('paraphrase-MiniLM-L6-v2')

                words = text.split()
                chunks = [' '.join(words[i:i+100])
                          for i in range(0, len(words), 100)]
                embeddings = model.encode(chunks)

                chunks_data = []
                for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                    embedding_instance = Embeddings(
                        name=file_name,
                        text=chunk,
                        chunk_number=i,
                        embedding=embedding.tolist()
                    )
                    embedding_instance.save()

                    chunks_data.append({
                        "index": i,
                        "file_name": file_name,
                        "chunk": chunk,
                        "embedding": embedding.tolist()
                    })

                all_files_data.append({
                    "file_name": file_name,
                    "chunks_data": chunks_data
                })

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
                embedding_instance = Embeddings(
                    name=file_name,
                    text=chunk,
                    chunk_number=i,
                    embedding=embedding.tolist()
                )
                embedding_instance.save()

                chunks_data.append({
                    "index": i,
                    "file_name": file_name,
                    "chunk": chunk,
                    "embedding": embedding.tolist()
                })

            all_files_data.append({
                "file_name": file_name,
                "chunks_data": chunks_data
            })

            # chunks_data = [
            #     {"index": i, "file name": file_name,
            #         "chunk": chunk, "embedding": embedding.tolist()}
            #     for i, (chunk, embedding) in enumerate(zip(chunks, embeddings))
            # ]

            response_data = {'all_files_data': all_files_data}
            if rejected_files:
                response_data['rejected_files'] = rejected_files
                response_data['message'] = 'Some files were rejected because their names already exist in the database.'

            return Response(response_data, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"An error occurred: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def get(self, request, *args, **kwargs):
        try:

            documents_with_chunks = Embeddings.objects.values('name').annotate(
                chunks_count=Count('chunk_number')).order_by('name')

            documents_list = list(documents_with_chunks)
            return Response(documents_list, status=status.HTTP_200_OK)
        except Exception as e:
            print(f"An error occurred: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def delete(self, request, *args, **kwargs):
        document_name = request.query_params.get('name', None)
        if document_name is None:
            return Response({"error": "Document name parameter 'name' is required for deletion."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            Embeddings.objects.filter(name=document_name).delete()
            return Response({"message": f"All chunks for document '{document_name}' have been deleted."}, status=status.HTTP_200_OK)
        except Exception as e:
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

#             return Response("embeddings", status=status.HTTP_200_OK)
#         except Exception as e:
#             print(f"An error occurred: {e}")
#             return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
