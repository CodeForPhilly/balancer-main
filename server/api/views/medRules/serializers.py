from rest_framework import serializers
from ...models.model_medRule import MedRule
from ..listMeds.serializers import MedicationSerializer
from ...models.model_embeddings import Embeddings


class EmbeddingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Embeddings
        fields = ['guid', 'name', 'text', 'page_num', 'chunk_number']


class MedRuleSerializer(serializers.ModelSerializer):
    medications = MedicationSerializer(many=True, read_only=True)
    sources = EmbeddingsSerializer(many=True, read_only=True)

    class Meta:
        model = MedRule
        fields = ['id', 'rule_type', 'history_type', 'reason', 'label',
                  'medications', 'sources', 'explanation']
