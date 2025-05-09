from rest_framework import serializers
from ...models.model_medRule import MedRule
from ..listMeds.serializers import MedicationSerializer
from ...models.model_embeddings import Embeddings
from ..listMeds.models import Medication

class EmbeddingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Embeddings
        fields = ['guid', 'name', 'text', 'page_num', 'chunk_number']


class MedRuleSerializer(serializers.ModelSerializer):
    medications = MedicationSerializer(many=True, read_only=True)
    medication_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Medication.objects.all(), source='medications'
    )
    sources = EmbeddingsSerializer(many=True, read_only=True)
    source_ids = serializers.PrimaryKeyRelatedField(
        many=True, write_only=True, queryset=Embeddings.objects.all(), source='sources'
    )

    class Meta:
        model = MedRule
        fields = [
            'id', 'rule_type', 'history_type', 'reason', 'label',
            'medications', 'medication_ids',
            'sources', 'source_ids',
            'explanation'
        ]