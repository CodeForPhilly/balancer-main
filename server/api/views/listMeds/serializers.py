from rest_framework import serializers
from .models import Diagnosis, Medication, Suggestion
class DiagnosisSerializer(serializers.ModelSerializer):
    class Meta:
        model = Diagnosis
        fields = '__all__'
class MedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Medication
        fields = ['name', 'benefits', 'risks']
class SuggestionSerializer(serializers.ModelSerializer):
    medication = MedicationSerializer()
    class Meta:
        model = Suggestion
        fields = ['medication', 'tier']