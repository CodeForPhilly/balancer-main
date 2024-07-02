from rest_framework import serializers
from .models import AI_PromptStorage
from django.conf import settings


class AI_PromptStorageSerializer(serializers.ModelSerializer):
    class Meta:
        model = AI_PromptStorage
        exclude = ('CreatedByUser', 'ModifiedByUser',)

    def create(self, validated_data):

        user = self.context['request'].user
        return AI_PromptStorage.objects.create(CreatedByUser=user, ModifiedByUser=user, **validated_data)
