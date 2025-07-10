from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Diagnosis, Medication, Suggestion
from .serializers import MedicationSerializer
# Constants for medication inclusion and exclusion
MEDS_INCLUDE = {'suicideHistory': ['Lithium']}
MED_EXCLUDE = {
    'kidneyHistory': ['Lithium'],
    'liverHistory': ['Valproate'],
    'bloodPressureHistory': ['Asenapine', 'Lurasidone', 'Olanzapine', 'Paliperidone', 'Quetiapine', 'Risperidone', 'Ziprasidone', 'Aripiprazole', 'Cariprazine'],
    'weightGainConcern': ['Quetiapine', 'Risperidone', 'Aripiprazole', 'Olanzapine']
}


class GetMedication(APIView):
    def post(self, request):
        data = request.data
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
                    med for med in include_result if med not in MED_EXCLUDE[condition]]
                exclude_result.extend(MED_EXCLUDE[condition])
        diag_query = Diagnosis.objects.filter(state=state_query)
        if diag_query.count() <= 0:
            return Response({'error': 'Diagnosis not found'}, status=status.HTTP_404_NOT_FOUND)
        diagnosis = diag_query[0]
        meds = {'first': '', 'second': '', 'third': ''}
        for med in include_result:
            meds['first'] += med + ", "
        for i, line in enumerate(['first', 'second', 'third']):
            for suggestion in Suggestion.objects.filter(diagnosis=diagnosis, tier=(i + 1)):
                to_exclude = False
                for med in exclude_result:
                    if med in suggestion.medication.name:
                        to_exclude = True
                        break
                if i > 0 and suggestion.medication.name in include_result:
                    to_exclude = True
                if not to_exclude:
                    meds[line] += suggestion.medication.name + ", "
            meds[line] = meds[line][:-2] if meds[line] else 'None'
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
        # Implement logic for adding new medications (if needed)
        # If adding medications, you would check if the medication already exists before creating it
        data = request.data
        name = data.get('name', '')
        if not name:
            return Response({'error': 'Medication name is required'}, status=status.HTTP_400_BAD_REQUEST)
        if Medication.objects.filter(name=name).exists():
            return Response({'error': 'Medication already exists'}, status=status.HTTP_400_BAD_REQUEST)
        # Assuming Medication model has `name`, `benefits`, `risks` as fields
        serializer = MedicationSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class AddMedication(APIView):
    """
    API endpoint to add a medication to the database with its risks and benefits.
    """

    def post(self, request):
        data = request.data
        name = data.get('name', '').strip()
        benefits = data.get('benefits', '').strip()
        risks = data.get('risks', '').strip()
        # Validate the inputs
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
    "API endpoint to delete medication if medication in database"

    def delete(self, request):
        data = request.data
        name = data.get('name', '').strip()
        print("ok vin")
        # Validate the inputs
        if not name:
            return Response({'error': 'Medication name is required'}, status=status.HTTP_400_BAD_REQUEST)
       # Check if medication exists
        if Medication.objects.filter(name=name).exists():
            # return f'Medication "{name}" exists'
            # Get the medication object
            medication = Medication.objects.get(name=name)
        # Delete the medication
            medication.delete()
            return Response({'success': "medication exists and will now be deleted"}, status=status.HTTP_201_CREATED)
        else:
            return Response({'error': 'Medication does not exist'}, status=status.HTTP_400_BAD_REQUEST)
        # ask user if sure to delete?
        # delete med from database
        # Medication.objects.filter(name=name)
