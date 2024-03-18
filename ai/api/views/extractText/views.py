from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
import openai
import os
import json
from langchain.vectorstores.pgvector import PGVector
import fitz
import pytesseract
from PIL import Image
import io
from django.core.files.uploadedfile import InMemoryUploadedFile


class ExtractTextAPIView(APIView):
    def post(self, request, *args, **kwargs):
        pdf_file: InMemoryUploadedFile = request.FILES.get('file')
        if not pdf_file:
            return Response({"error": "No PDF file provided."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            pdf_file = fitz.open(stream=pdf_file.read(),
                                 filetype="pdf")  # Open the PDF
            # Initialize a list to hold the text extracted from each page.
            pages_text = []

            for pageNumber, page in enumerate(pdf_file, start=1):
                # Convert the PDF page to a PIL Image object.
                pix = page.get_pixmap()
                img_bytes = pix.tobytes("ppm")
                image = Image.open(io.BytesIO(img_bytes))
                # Use pytesseract to do OCR on the image.
                page_text = pytesseract.image_to_string(image)
                # Append a dictionary with page number and extracted text to the `pages_text` list.
                pages_text.append(
                    {"page_number": pageNumber, "text": page_text})

                # Optionally, you can print page number and text after processing each page, but it's commented out here
                # to avoid cluttering server logs
                # print(f"Page Number: {pageNumber}")
                # print(page_text)

            # Return the combined text from all pages after finishing the loop
            return Response({"pages": pages_text}, status=status.HTTP_200_OK)
        except Exception as e:
            # Print the error and return a response indicating an internal server error
            print(f"An error occurred: {e}")
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
