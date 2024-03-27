from rest_framework import serializers
from .models import AI_Settings


class AISettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AI_Settings
        fields = ['guid', 'SettingGUID', 'SettingValue',
                  'SourceTable', 'LastModified', 'ModifiedByUser']
        # Assuming you don't want these to be directly settable
        read_only_fields = ('guid', 'LastModified', 'ModifiedByUser')

    def create(self, validated_data):
        # If you need custom creation logic, especially for handling the ModifiedByUser
        return super().create(validated_data)
