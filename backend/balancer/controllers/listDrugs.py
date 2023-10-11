from django.http import JsonResponse
import os
import openai
import json

# XXX: remove csrf_exempt usage before production
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def medication(request):
    openai.api_key = os.environ.get("OPENAI_API_KEY")
    data = json.loads(request.body)

    if data is not None:
        diagnosis = data["diagnosis"]
    else:
        return JsonResponse(
            {"error": "Diagnosis not found. Request must include diagnosis."}
        )

    ai_response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": f"Please provide the most commonly prescribed medications for {diagnosis}. I want only the drug names seperated by a comma and noting else"
            }
        ],
    )

    drug_list = ai_response["choices"][0]["message"]["content"].split(",")
    # Return the JSON response with drugs list
    return JsonResponse({"drugs": drug_list})
