#Views: Handle the business logic and interact with models to return responses (usually HTML or JSON).from django.http import JsonResponse
from .models import Diagnosis, Medication, Suggestion
from django.views.decorators.csrf import csrf_exempt
import json

MEDS_INCLUDE = {'suicideHistory': ['Lithium']}
MED_EXCLUDE = {
    'kidneyHistory': ['Lithium'],
    'liverHistory': ['Valproate'],
    'bloodPressureHistory': ['Asenapine', 'Lurasidone', 'Olanzapine', 'Paliperidone', 'Quetiapine', 'Risperidone', 'Ziprasidone', 'Aripiprazole', 'Cariprazine'],
    'weightGainConcern': ['Quetiapine', 'Risperidone', 'Aripiprazole', 'Olanzapine']
}


@csrf_exempt
def list_of_rules(request):
    name_query = request.GET.get('name', None)

    if name_query:
        try:
            medication = Medication.objects.get(name=name_query)
            response_data = {
                'name': medication.name,
                'benefits': medication.benefits,
                'risks': medication.risks
            }
        except Medication.DoesNotExist:
            return JsonResponse({'error': 'Medication not found'}, status=404)
    else:
        medications = Medication.objects.all()
        response_data = [{'name': med.name, 'benefits': med.benefits, 'risks': med.risks} for med in medications]

    # safe=False is needed if response_data is a list
    return JsonResponse(response_data, safe=False)
