from django.http import JsonResponse
from .models import uploadFiles
from django.views.decorators.csrf import csrf_exempt
import json


@csrf_exempt
def uploadFiles(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        # state_query = data.get('state', '').lower()
        # print("Debug: state_query =", state_query)

        # if state_query not in [choice[0] for choice in StateMedication.STATE_CHOICES]:
        #     print("Debug: state_medication =",  StateMedication.STATE_CHOICES)
        #     return JsonResponse({'error': 'Invalid state'}, status=400)

        # try:
        #     state_medication = StateMedication.objects.get(state=state_query)
        #     # print("Debug: state_medication =", state_medication)
        # except StateMedication.DoesNotExist:
        #     return JsonResponse({'error': 'State not found'}, status=404)

        meds = {
            'first': 'fd',
            'second': 'fd',
            'third': 'fd'
        }

        return JsonResponse(meds)
    else:
        return JsonResponse({'error': 'Invalid request method'}, status=405)
