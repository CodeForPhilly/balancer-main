from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import json
from .models import UploadFile as UploadFileModel
from .serializers import UploadFileSerializer, UploadFileGetSerializer
from .paginators import UploadFilePageNumberPagination


@method_decorator(csrf_exempt, name="dispatch")
class UploadFile(APIView):
    permission_classes = [IsAuthenticated]
    pagination_class = UploadFilePageNumberPagination

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
                        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    )
            else:
                return Response(
                    {
                        "message": f'Error. Incompatible file type. Acceptable types: {", ".join(str(i) for i in acceptable_file_types)}.'
                    }
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, format=None):
        queryset = UploadFileModel.objects.all()
        paginator = self.pagination_class()
        page = paginator.paginate_queryset(queryset, request)
        if page is not None:
            serializer = UploadFileGetSerializer(page, many=True)
            return paginator.get_paginated_response(serializer.data)
        serializer = UploadFileGetSerializer(queryset, many=True)
        return serializer.data
