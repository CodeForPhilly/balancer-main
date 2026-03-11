import os

from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import serializers as drf_serializers
from drf_spectacular.utils import extend_schema, inline_serializer


class VersionView(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        responses={200: inline_serializer(name='VersionResponse', fields={
            'version': drf_serializers.CharField(),
        })}
    )
    def get(self, request, *args, **kwargs):
        version = os.environ.get("VERSION") or "dev"
        return Response({"version": version})
