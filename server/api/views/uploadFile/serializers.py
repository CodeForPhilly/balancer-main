from rest_framework import serializers
from .models import UploadFile

class UploadFileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UploadFile
        exclude = ['id', 'guid', 'analyzed', 'approved', 'file']