from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import json
import base64
from .models import UploadFile
from .serializers import UploadFileSerializer


@method_decorator(csrf_exempt, name="dispatch")
class UploadFile(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, format=None):
        if not request.user.is_superuser:
            return Response(
                {"message": "Error, user is not a superuser."},
                status=status.HTTP_401_UNAUTHORIZED,
            )
        acceptable_file_types = ["pdf"]
        data = json.loads(request.data["data"])
        serializer = UploadFileSerializer(data=data)
        if serializer.is_valid():
            if serializer.validated_data["file_type"] in acceptable_file_types:
                try:
                    serializer.validated_data["file"] = request.FILES["file"].read()
                    serializer.save()
                    return Response(
                        {"message": serializer.data}, status=status.HTTP_201_CREATED
                    )
                except:
                    return Response(
                        {"message": "Error. Something went wrong."},
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
            else:
                return Response(
                    {
                        "message": f'Error. Incompatible file type. Acceptable types: {", ".join(str(i) for i in acceptable_file_types)}.'
                    }
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
