from rest_framework import serializers
from .models import UploadedFile


class UploadFileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UploadedFile
        exclude = ["id", "guid", "analyzed", "approved"]

class UploadFileGetSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = UploadedFile
        fields = '__all__'