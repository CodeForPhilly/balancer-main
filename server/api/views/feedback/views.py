
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import status
from django.http import JsonResponse, HttpRequest
from django import forms
import requests
import json
import os
from .models import Feedback
from .serializers import FeedbackSerializer

# XXX: remove csrf_exempt usage before production
from django.views.decorators.csrf import csrf_exempt


class FeedbackView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = FeedbackSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
