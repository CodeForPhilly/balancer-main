from rest_framework import serializers
from ...models.model_medRule import MedRule


class MedRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedRule
        fields = ['id', 'rule_type', 'history_type',
                  'reason', 'label', 'medication']
        depth = 1  # This will include the full medication object instead of just the ID
