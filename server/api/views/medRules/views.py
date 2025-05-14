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
from ..uploadFile.models import UploadFile
from ...models.model_embeddings import Embeddings

@method_decorator(csrf_exempt, name='dispatch')
class MedRules(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        # Get all med rules
        med_rules = MedRule.objects.all()

        # Serialize the data
        serializer = MedRuleSerializer(med_rules, many=True)

        data = {
            'status': 'success',
            'count': len(serializer.data),
            'results': serializer.data
        }

        return Response(data, status=status.HTTP_200_OK)
    
    def post(self, request):

        data = request.data
        
        for field in ['rule_type', 'history_type', 'reason', 'label', 'medication_names', 'chunk_ids', 'file_guid', 'explanation']:
            if field not in data:
                return Response({'error': f'Missing required field: {field}'}, status=status.HTTP_400_BAD_REQUEST)
    
        # The exists() method only checks for existence making it more efficient than loading all values into memory and performing set operations
        if any(not Medication.objects.filter(name=name).exists() for name in data['medication_names']):
            return Response({'error': 'One or more specified medication names do not exist in the database'}, status=status.HTTP_404_NOT_FOUND)
        
        medication_ids = Medication.objects.filter(name__in=data['medication_names']).values_list('id', flat=True)

        if not UploadFile.objects.filter(guid=data['file_guid']).exists():
            return Response({'error': 'No uploaded file found in the database for the provided GUID.'}, status=status.HTTP_404_NOT_FOUND)

        upload_file_id = UploadFile.objects.get(guid=data['file_guid']).id

        # The exists() method only checks for existence making it more efficient than loading all values into memory and performing set operations
        if any(not Embeddings.objects.filter(upload_file_id=upload_file_id, chunk_number=chunk).exists() for chunk in data['chunk_ids']):
            return Response({'error': 'One or more embeddings were not found for the given file and chunk numbers in the database'}, status=status.HTTP_404_NOT_FOUND)

        embeddings_ids = Embeddings.objects.filter(upload_file_id=upload_file_id, chunk_number__in=data['chunk_ids']).values_list('id', flat=True)

        data = {
            'rule_type': data['rule_type'],
            'history_type': data['history_type'],
            'reason': data['reason'],
            'label': data['label'],
            'medication_ids': list(medication_ids),
            'source_ids': list(embeddings_ids),
            'explanation': data['explanation']
        }

        #Insert medications and sources into the below Django model  with HTTP POST method
        serializer = MedRuleSerializer(data=data)
        
        if serializer.is_valid():

            # Save the MedRule instance first
            med_rule_instance = serializer.save()

            # Now manually set the many-to-many relationships
            med_rule_instance.medications.set(medication_ids)  # This will link the medications
            med_rule_instance.sources.set(embeddings_ids)      # This will link the sources
            
            # Save the instance again to persist the relationships
            med_rule_instance.save()
            
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)