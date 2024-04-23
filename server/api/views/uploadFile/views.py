from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import pdfplumber
from .models import UploadFile  # Import your UploadFile model
from django.core.files.base import ContentFile
import os


@method_decorator(csrf_exempt, name='dispatch')
class UploadFileView(APIView):
    # permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        print(request.auth)
        print(f"UploadFileView post called. Path: {request.path}")
        if not request.user.is_superuser:
            return Response(
                {"message": "Error, user is not a superuser."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

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
                pdf_binary = uploaded_file.read()

                # Create a new UploadFile instance and populate it
                new_file = UploadFile(
                    file_name=uploaded_file.name,
                    file=pdf_binary,
                    size=size,
                    page_count=page_count,
                    file_type=file_type,
                    # Assuming you want to capture who uploaded the file
                    uploaded_by=request.user.username
                )
                new_file.save()

                return Response(
                    {"message": "File uploaded successfully.",
                        "file_id": new_file.id},
                    status=status.HTTP_201_CREATED,
                )
        except Exception as e:
            return Response(
                {"message": f"Error processing PDF: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
