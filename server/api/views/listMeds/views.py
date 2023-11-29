from django.http import JsonResponse
from .models import StateMedication
from django.views.decorators.csrf import csrf_exempt
import json


@csrf_exempt
def get_medication(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        state_query = data.get('state')

        if state_query not in [choice[0] for choice in StateMedication.STATE_CHOICES]:
            return JsonResponse({'error': 'Invalid state'}, status=400)

        try:
            state_medication = StateMedication.objects.get(state=state_query)
        except StateMedication.DoesNotExist:
            return JsonResponse({'error': 'State not found'}, status=404)

        meds = {
            'high_med': state_medication.high_med,
            'medium_med': state_medication.medium_med,
            'low_med': state_medication.low_med
        }

        return JsonResponse(meds)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
