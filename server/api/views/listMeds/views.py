from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Diagnosis, Medication, Suggestion
from .serializers import MedicationSerializer
# Constants for medication inclusion and exclusion
MEDS_INCLUDE = {
    'suicideHistory': ['Lithium']
}

MED_EXCLUDE = {
    'kidneyHistory': ['Lithium'],
    'liverHistory': ['Valproate'],
    'bloodPressureHistory': [
        'Asenapine', 'Lurasidone', 'Olanzapine', 'Paliperidone',
        'Quetiapine', 'Risperidone', 'Ziprasidone', 'Aripiprazole', 'Cariprazine'
    ],
    'weightGainConcern': ['Quetiapine', 'Risperidone', 'Aripiprazole', 'Olanzapine']
}


class GetMedication(APIView):
    def post(self, request):
        data = request.data
        print(data)
        state_query = data.get('state', '')
        include_result = []
        exclude_result = []
        for condition in MEDS_INCLUDE:
            if data.get(condition, False):
                include_result.extend(MEDS_INCLUDE[condition])
        for condition in MED_EXCLUDE:
            if data.get(condition, False):
                # Remove any medication from include list that is in the exclude list
                include_result = [
                    med for med in include_result if med not in MED_EXCLUDE[condition]
                ]
                exclude_result.extend(MED_EXCLUDE[condition])
        try:
            diagnosis = Diagnosis.objects.get(state=state_query)
        except Diagnosis.DoesNotExist:
            return Response({'error': 'Diagnosis not found'}, status=status.HTTP_404_NOT_FOUND)
        meds = {'first': [], 'second': [], 'third': []}

        priorMeds = data.get('priorMedications', "").split(',')
        exclude_result.extend([med.strip() for med in priorMeds if med.strip()])
        print(exclude_result)
        included_set = set(include_result)
        excluded_set = set(exclude_result)

        for med in include_result:
            meds['first'].append({'name': med, 'source': 'include'})

        for i, tier_label in enumerate(['first', 'second', 'third']):
            suggestions = Suggestion.objects.filter(
                diagnosis=diagnosis, tier=i+1
            )
            for suggestion in suggestions:
                med_name = suggestion.medication.name
                if med_name in excluded_set:
                    continue
                if i > 0 and med_name in included_set:
                    continue
                meds[tier_label].append({
                    'name': med_name,
                    'source': 'diagnosis'
                })

        return Response(meds)


class ListOrDetailMedication(APIView):
    def get(self, request):
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

    def post(self, request):
        return Response({'error': 'Use AddMedication endpoint for creating medications'}, status=status.HTTP_405_METHOD_NOT_ALLOWED)


class AddMedication(APIView):
    """
    API endpoint to add a medication to the database with its risks and benefits.
    """

    def post(self, request):
        data = request.data
        name = data.get('name', '').strip()
        benefits = data.get('benefits', '').strip()
        risks = data.get('risks', '').strip()
        
        # Validate required fields
        if not name:
            return Response({'error': 'Medication name is required'}, status=status.HTTP_400_BAD_REQUEST)
        if not benefits:
            return Response({'error': 'Medication benefits are required'}, status=status.HTTP_400_BAD_REQUEST)
        if not risks:
            return Response({'error': 'Medication risks are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if medication already exists
        if Medication.objects.filter(name=name).exists():
            return Response({'error': f'Medication "{name}" already exists'}, status=status.HTTP_400_BAD_REQUEST)
        # Create and save the new medication
        serializer = MedicationSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class DeleteMedication(APIView):
    """
    API endpoint to delete medication if medication in database.
    """

    def delete(self, request):
        data = request.data
        name = data.get('name', '').strip()
        
        # Validate required fields
        if not name:
            return Response({'error': 'Medication name is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if medication exists and delete
        try:
            medication = Medication.objects.get(name=name)
            medication.delete()
            return Response({'success': f'Medication "{name}" has been deleted'}, status=status.HTTP_200_OK)
        except Medication.DoesNotExist:
            return Response({'error': f'Medication "{name}" does not exist'}, status=status.HTTP_404_NOT_FOUND)
