from django.http import JsonResponse
from .models import StateMedication
from django.views.decorators.csrf import csrf_exempt
import json


@csrf_exempt
def get_medication(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        state_query = data.get('state', '').lower()
        print("Debug: state_query =", state_query)

        if state_query not in [choice[0] for choice in StateMedication.STATE_CHOICES]:
            print("Debug: state_medication =",  StateMedication.STATE_CHOICES)
            return JsonResponse({'error': 'Invalid state'}, status=400)

        try:
            state_medication = StateMedication.objects.get(state=state_query)
            # print("Debug: state_medication =", state_medication)
        except StateMedication.DoesNotExist:
            return JsonResponse({'error': 'State not found'}, status=404)

        meds = {
            'first': state_medication.get_first_display(),
            'second': state_medication.get_second_display(),
            'third': state_medication.get_third_display()
        }

        return JsonResponse(meds)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
