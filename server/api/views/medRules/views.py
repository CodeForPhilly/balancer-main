from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
import openai
# from ..embeddings_manage.models import Embeddings
import os
from ...services.embedding_services import get_closest_embeddings
import logging
import json
import uuid
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from ...services.conversions_services import convert_uuids


@method_decorator(csrf_exempt, name='dispatch')
class MedRules(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        print("MedRules, get list")

        # Get the authenticated user
        user = request.user

        data = {
            'message': 'test'
        }

        return Response(data, status=status.HTTP_200_OK)
