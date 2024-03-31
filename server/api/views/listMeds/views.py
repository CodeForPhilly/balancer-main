from django.http import JsonResponse
from .models import Diagnosis, Medication, Suggestion
from django.views.decorators.csrf import csrf_exempt
import json

MEDS_INCLUDE = { 'suicideHistory': ['Lithium'] }
MED_EXCLUDE = {
    'kidneyHistory': ['Lithium'],
    'liverHistory': ['Valproate'],
    'bloodPressureHistory': ['Asenapine', 'Lurasidone', 'Olanzapine', 'Paliperidone', 'Quetiapine', 'Risperidone', 'Ziprasidone', 'Aripiprazole', 'Cariprazine'],
    'weightGainConcern': ['Quetiapine', 'Risperidone', 'Aripiprazole', 'Olanzapine']
}

@csrf_exempt
def get_medication(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        print("Debug: data =", data)
        state_query = data.get('state', '')

        include_result = []
        exclude_result = []
        for condition in MEDS_INCLUDE:
            if data.get(condition, False):
                include_result.extend(MEDS_INCLUDE[condition])
        for condition in MED_EXCLUDE:
            if data.get(condition, False):
                include_result = [med for med in include_result if med not in MED_EXCLUDE[condition]]
                exclude_result.extend(MED_EXCLUDE[condition])

        diag_query = Diagnosis.objects.filter(state=state_query)
        if diag_query.count() <= 0:
            return JsonResponse({'error': 'Diagnosis not found'}, status=404)
        diagnosis = diag_query[0]

        meds = { 'first': '', 'second': '', 'third': '' }
        for med in include_result:
            meds['first'] += med + ", "
        for (i, line) in enumerate(['first', 'second', 'third']):
            for suggestion in Suggestion.objects.filter(diagnosis=diagnosis, tier=(i+1)):
                to_exclude = False
                for med in exclude_result:
                    if med in suggestion.medication.name:
                        to_exclude = True
                        break
                if i > 0 and suggestion.medication.name in include_result:
                    to_exclude = True
                if not to_exclude:
                    meds[line] += suggestion.medication.name + ", "
            meds[line] = meds[line][:-2]
            if meds[line] == '':
                meds[line] = 'None'
        print(meds)
        return JsonResponse(meds)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
