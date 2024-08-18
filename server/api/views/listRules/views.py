#Views: Handle the business logic and interact with models to return responses (usually HTML or JSON).from django.http import JsonResponse

from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
# import json


@csrf_exempt
def list_of_rules(request):
    print ('Hello')
    if request.method == "GET":
        return JsonResponse({'Message': 'Test'}, safe=False)
    return JsonResponse({'Message': 'Test'}, safe=False)
