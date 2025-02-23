from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from ...models.model_medRule import MedRule
from .serializers import MedRuleSerializer  # You'll need to create this
from ..listMeds.models import Medication
from ..listMeds.serializers import MedicationSerializer


@method_decorator(csrf_exempt, name='dispatch')
class MedRules(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        print("test")
        name_query = request.query_params.get('name', None)
        if name_query:
            try:
                medication = Medication.objects.get(name=name_query)
                serializer = MedicationSerializer(medication)
                return Response(serializer.data)
            except Medication.DoesNotExist:
                return Response({'error': 'Medication not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            medications = Medication.objects.all()
            serializer = MedicationSerializer(medications, many=True)
            return Response(serializer.data)

@method_decorator(csrf_exempt, name='dispatch')
class ListOrDetailMedication(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        name_query = request.query_params.get('name', None)
        if name_query:
            try:
                return Response({'complete'})
            except Medication.DoesNotExist:
                return Response({'error': 'Medication not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            medications = Medication.objects.all()
            serializer = MedicationSerializer(medications, many=True)
            return Response(serializer.data)
