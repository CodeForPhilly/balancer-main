import os

from rest_framework.permissions import AllowAny
from rest_framework.views import APIView
from rest_framework.response import Response


class VersionView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        version = os.environ.get("VERSION") or "dev"
        return Response({"version": version})
