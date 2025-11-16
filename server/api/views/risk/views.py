from django.http import JsonResponse
import os
import openai
import json
from api.views.listMeds.models import Medication

# XXX: remove csrf_exempt usage before production
from django.views.decorators.csrf import csrf_exempt


@csrf_exempt
def medication(request):
    openai.api_key = os.environ.get("OPENAI_API_KEY")
    data = json.loads(request.body)

    if data is not None:
        # the variable name is diagnosis but this variable contain the medication name
        diagnosis = data["diagnosis"]
    else:
        return JsonResponse({"error": "Diagnosis not found. Request must include diagnosis."})

    try:
        med = Medication.objects.get(name=diagnosis)
        benefits = [f'- {benefit}' for benefit in med.benefits.split(', ')]
        risks = [f'- {risk}' for risk in med.risks.split(', ')]
        return JsonResponse({
            'benefits': benefits,
            'risks': risks
        })
    except Medication.DoesNotExist:
        ai_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": f"You are to provide a concise list of 5 key benefits and 5 key risks for the medication suggested when taking it for Bipolar. Each point should be short, clear and be kept under 10 words. Begin the benefits section with !!!benefits!!! and the risks section with !!!risk!!!. Please provide this information for the medication: {diagnosis}."
                }
            ]
        )

        content = ai_response['choices'][0]['message']['content']

        if '!!!benefits!!!' not in content or '!!!risks!!!' not in content:
            return JsonResponse({"error": "Unexpected format in the response content."})

        # Split the content into benefits and risks sections
        benefits_selection = content.split(
            '!!!risks!!!')[0].replace('!!!benefits!!!', '').strip()
        risks_selection = content.split('!!!risks!!!')[1].strip()

        # Split  the sections into individiual points
        # Taking every second item as the benefits and risks are on alternate lines
        benefits = benefits_selection.split('\n')
        risks = risks_selection.split('\n')
        content = content

        return JsonResponse({
            'benefits': benefits,
            'risks': risks
        })
