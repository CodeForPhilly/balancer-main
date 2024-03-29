from rest_framework import serializers

class ChatGPTSerializer(serializers.Serializer):
    message = serializers.CharField()