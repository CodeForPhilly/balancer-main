from django.http import JsonResponse
import os
import openai
import json

# XXX: remove csrf_exempt usage before production
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def medication(request):
    openai.api_key = os.getenv('OPENAI_API_KEY')
    print(os.getenv('OPENAI_API_KEY'))

    if request.method == 'OPTIONS':
        # You can customize the response as needed for CORS, like setting headers
        return JsonResponse({'message': 'OK'})
    data = json.loads(request.body)

    if data is not None:
        diagnosis = data.get('diagnosis')

    ai_response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "Please provide a table of the most commonly prescribed medications for %s. The table should be in HTML format, without any <head> tags. It should have a maximum width of 630px, with a margin of 0 for the top and bottom. The table should consist of two columns: 'Medication Class' and 'Medication Names'. Each cell should have a left padding and a border, and the text in the 'Medication Class' and 'Medications' cells should be displayed in bold. No other cells should be bold." % diagnosis, }]
    )

    return JsonResponse({'message': ai_response})
