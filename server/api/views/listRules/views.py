#Views: Handle the business logic and interact with models to return responses (usually HTML or JSON).from django.http import JsonResponse

from django.views.decorators.csrf import csrf_exempt # type: ignore
from django.http import JsonResponse # type: ignore


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
#             medications = [mr.medication_id.name for mr in medication_rules]  # Adjust field name accordingly
            
#             # Create the rule entry
#             rule_entry = {
#                 "rule": rule.rule,
#                 "type": rule.type,
#                 "medications": medications
#             }
            
#             # Add to appropriate type
#             if rule.type == 'includes':
#                 result['include'].append(rule_entry)
#             elif rule.type == 'excludes':
#                 result['exclude'].append(rule_entry)
        
#         return JsonResponse(result, safe=False)

#     return JsonResponse({'Message': 'Invalid request method'}, status=405)