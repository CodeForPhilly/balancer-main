from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import UpdateAPIView
import pdfplumber
from .models import UploadFile  # Import your UploadFile model
from .serializers import UploadFileSerializer
from django.http import HttpResponse
from ...services.sentencetTransformer_model import TransformerModel
from ...models.model_embeddings import Embeddings
import fitz
from django.db import transaction
from .title import generate_title


class UploadFileView(APIView):

    def get(self, request, format=None):
        print("UploadFileView, get list")

        # Get the authenticated user
        user = request.user

        # Filter the files uploaded by the authenticated user
        files = UploadFile.objects.filter(uploaded_by=user.id).defer(
            'file').order_by('-date_of_upload')

        serializer = UploadFileSerializer(files, many=True)
        return Response(serializer.data)

    def post(self, request, format=None):
        print(request.auth)
        print(f"UploadFileView post called. Path: {request.path}")
        # if not request.user.is_superuser:
        #     return Response(
        #         {"message": "Error, user is not a superuser."},
        #         status=status.HTTP_401_UNAUTHORIZED,
        #     )

        uploaded_file = request.FILES.get('file')
        if uploaded_file is None:
            return Response(
                {"message": "No file was provided."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not uploaded_file.name.endswith('.pdf'):
            return Response(
                {"message": "Only PDF files are accepted."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with pdfplumber.open(uploaded_file) as pdf:
                pages = pdf.pages
                page_count = len(pages)
                file_type = 'pdf'  # Since you are only accepting PDFs
                size = uploaded_file.size  # Size in bytes

                # Read the entire PDF to store in the BinaryField
                uploaded_file.seek(0)
                pdf_binary = uploaded_file.read()
            with transaction.atomic():
                # Create a new UploadFile instance and populate it
                new_file = UploadFile(
                    file_name=uploaded_file.name,
                    file=pdf_binary,
                    size=size,
                    page_count=page_count,
                    file_type=file_type,
                    uploaded_by=request.user,  # Set to the user instance
                    uploaded_by_email=request.user.email  # Also store the email separately
                )

                with fitz.open(stream=pdf_binary, filetype="pdf") as doc:
                    text = ""
                    page_number = 1  # Initialize page_number
                    page_texts = []  # List to hold text for each page with page number

                    title = generate_title(doc)
                    if title is not None:
                        new_file.title = title

                    for page in doc:
                        page_text = page.get_text()
                        text += page_text
                        page_texts.append((page_number, page_text))

                        page_number += 1

                new_file.save()
                if new_file.id is None:
                    return Response({"message": "Failed to save the upload file."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

                chunks_with_page = []

                # Create chunks along with their corresponding page number
                for page_num, page_text in page_texts:
                    words = page_text.split()
                    chunks = [' '.join(words[i:i+100])
                              for i in range(0, len(words), 100)]
                    for chunk in chunks:
                        chunks_with_page.append((page_num, chunk))

                model = TransformerModel.get_instance().model
                # Encode each chunk and save embeddings
                embeddings = model.encode(
                    [chunk for _, chunk in chunks_with_page])

                for i, ((page_num, chunk), embedding) in enumerate(zip(chunks_with_page, embeddings)):
                    Embeddings.objects.create(
                        upload_file=new_file,
                        name=new_file.file_name,  # You may adjust the naming convention
                        title=title,  # Set the title from the document
                        text=chunk,
                        chunk_number=i,
                        page_num=page_num,  # Store the page number here
                        embedding_sentence_transformers=embedding.tolist()
                    )
            return Response(
                {"message": "File uploaded successfully.",
                 "file_id": new_file.id},
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            # Handle potential errors
            return Response({"message": f"Error processing file and embeddings: {str(e)}"},
                            status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, format=None):
        guid = request.data.get('guid')
        if not guid:
            return Response({"message": "No file ID provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            with transaction.atomic():
                # Fetch the file to delete
                upload_file = UploadFile.objects.get(guid=guid)

                # Check if the user has permission to delete this file
                if upload_file.uploaded_by != request.user:
                    return Response({"message": "You do not have permission to delete this file."}, status=status.HTTP_403_FORBIDDEN)

                # Delete related embeddings
                Embeddings.objects.filter(upload_file=upload_file).delete()

                # Delete the file
                upload_file.delete()

            return Response({"message": "File and related embeddings deleted successfully."}, status=status.HTTP_200_OK)
        except UploadFile.DoesNotExist:
            return Response({"message": "File not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"message": f"Error deleting file and embeddings: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RetrieveUploadFileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, guid, format=None):
        try:
            file = UploadFile.objects.get(
                guid=guid, uploaded_by=request.user.id)
            response = HttpResponse(file.file, content_type='application/pdf')
            # print(file.file[:100])
            response['Content-Disposition'] = f'attachment; filename="{file.file_name}"'
            return response
        except UploadFile.DoesNotExist:
            return Response({"message": "No file found or access denied."}, status=status.HTTP_404_NOT_FOUND)


class EditFileMetadataView(UpdateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = UploadFileSerializer
    lookup_field = 'guid'

    def get_queryset(self):

        # Ensure that users can only edit files they uploaded
        return UploadFile.objects.filter(uploaded_by=self.request.user)
