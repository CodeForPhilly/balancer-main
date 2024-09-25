from rest_framework import serializers
from .models import Conversation, Message

class MessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = Message
        fields = ['content', 'is_user']

class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True)

    class Meta:
        model = Conversation
        fields = ['id', 'title', 'created_at', 'updated_at', 'messages']

    def create(self, validated_data):
        messages_data = validated_data.pop('messages')
        conversation = Conversation.objects.create(**validated_data)
        for message_data in messages_data:
            Message.objects.create(conversation=conversation, **message_data)
        return conversation