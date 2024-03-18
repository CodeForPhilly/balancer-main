
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
    

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import UploadFile
from .serializers import UploadFileSerializer

@method_decorator(csrf_exempt, name='dispatch')
class UploadFile(APIView):
    authentication_classes = []
    permission_classes = []

    def post(self, request, format=None):
        serializer = UploadFileSerializer(data=request.data)
        file_obj = request.data['file']
        if serializer.is_valid():
            #serializer.save()
            return Response({'content': serializer.data, 'file': file_obj}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)