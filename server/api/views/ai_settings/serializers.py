from rest_framework import serializers
from .models import AI_Settings


class AISettingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = AI_Settings
        fields = ['guid', 'SourceTableGUID', 'SettingValue', 'SettingsLabel',
                  'SourceTable', 'LastModified', 'ModifiedByUser']
        read_only_fields = ('guid', 'LastModified', 'ModifiedByUser')
        # If you want 'settingsLabel' to be read-only as well, add it to the tuple above

    def create(self, validated_data):
        # If you need custom creation logic, especially for handling the ModifiedByUser
        # Note: The request.user should be passed to the save method from the view
        return super().create(validated_data)
