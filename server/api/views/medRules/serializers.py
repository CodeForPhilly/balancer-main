from rest_framework import serializers
from ...models.model_medRule import MedRule, MedRuleSource
from ..listMeds.serializers import MedicationSerializer
from ...models.model_embeddings import Embeddings


class EmbeddingsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Embeddings
        fields = ["guid", "name", "text", "page_num", "chunk_number"]


class MedicationWithSourcesSerializer(serializers.Serializer):
    medication = MedicationSerializer()
    sources = EmbeddingsSerializer(many=True)


class MedRuleSerializer(serializers.ModelSerializer):
    medication_sources = serializers.SerializerMethodField()

    class Meta:
        model = MedRule
        fields = [
            "id",
            "rule_type",
            "history_type",
            "reason",
            "label",
            "explanation",
            "medication_sources",
        ]

    def get_medication_sources(self, obj):
        medrule_sources = MedRuleSource.objects.filter(medrule=obj).select_related(
            "medication", "embedding"
        )

        med_to_sources = {}
        for ms in medrule_sources:
            if ms.medication.id not in med_to_sources:
                med_to_sources[ms.medication.id] = {
                    "medication": ms.medication,
                    "sources": [],
                }
            med_to_sources[ms.medication.id]["sources"].append(ms.embedding)

        return [
            {
                "medication": MedicationSerializer(data["medication"]).data,
                "sources": EmbeddingsSerializer(data["sources"], many=True).data,
            }
            for data in med_to_sources.values()
        ]
