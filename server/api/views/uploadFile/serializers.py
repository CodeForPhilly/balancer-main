from rest_framework import serializers
from .models import UploadFile
import uuid
import base64


class UploadFileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UploadFile
        exclude = ["id", "guid", "analyzed", "approved"]
