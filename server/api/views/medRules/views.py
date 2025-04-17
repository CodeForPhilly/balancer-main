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

        # medications
        # Return an error if  the query doesn't return any rows

        # SELECT * FROM public.api_medication
        # WHERE id = '1'

        import pdb; pdb.set_trace()

        Medication.objects.filter(id__in=data['medications']).values('id', 'name', 'benefits', 'risks')   

        # sources
        # Return an error if the query doesn't return any rows

        # SELECT id, guid FROM public.api_uploadfile
        # WHERE guid = '50c05484-d905-4383-9e5a-d8b62743afb6'

        UploadFile.objects.filter(guid=data['file_guid']).values('id', 'guid') 


        # # Return an error if the query doesn't return any rows
        # SELECT id FROM public.api_embeddings
        # WHERE upload_file_id =12 and chunk_number in (44,45,46)

        Embeddings.objects.filter(upload_file_id=12, chunk_number__in=data['sources']).values('id')


        # Insert medications and sources into the below Django model  with HTTP POST method
        # serializer = MedRuleSerializer(data=, many=True)
        
        # if serializer.is_valid():
        #     serializer.save()
        #     return Response(serializer.data, status=status.HTTP_201_CREATED)
        # else:
        #     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        return data