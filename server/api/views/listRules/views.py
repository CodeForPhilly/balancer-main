#Views: Handle the business logic and interact with models to return responses (usually HTML or JSON).from django.http import JsonResponse

from django.views.decorators.csrf import csrf_exempt 
from django.http import JsonResponse 
from .models import Medication_Rules


# @csrf_exempt
# def get_rules(request):
#     if request.method == "POST":

@csrf_exempt
def list_of_rules(request):
    print ('Hello')
    if request.method == "GET":
        return JsonResponse({'Message': 'Test'}, safe=False)
    return JsonResponse({'Message': 'Test'}, safe=False)

# @csrf_exempt
# def list_of_rules(request):
#     if request.method == "GET":
#         # Fetch all rules
#         rules = Rules.objects.all()
        
#         # Prepare a dictionary to hold our result
#         result = {"include": [], "exclude": []}
        
#         # Process each rule
#         for rule in rules:
#             # Get related medication rules
#             medication_rules = Medication_Rules.objects.filter(rule_id=rule.id)

