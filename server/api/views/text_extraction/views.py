import os

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import anthropic

from api.models.model_embeddings import Embeddings


# TODO: Add docstrings and type hints
def anthropic_citations(client, content_chunks, user_prompt): 
    """
    """

    message = client.messages.create(
        model="claude-3-5-haiku-20241022",
        max_tokens=1024,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "document",
                        "source": {
                            "type": "content",
                            "content": content_chunks
                        },
                        "citations": {"enabled": True}
                    },
    
                    {
                        "type": "text",
                        "text": user_prompt
                    }
                ]
            }
        ],
    )

    
    # Response Structure: https://docs.anthropic.com/en/docs/build-with-claude/citations#response-structure
            
    text = []
    cited_text = []
    for content in message.to_dict()['content']:
        text.append(content['text'])
        if 'citations' in content.keys():
            text.append(" ".join([f"<{citation['start_block_index']} - {citation['end_block_index']}>" for citation in content['citations']]))
            cited_text.append(" ".join([f"<{citation['start_block_index']} - {citation['end_block_index']}> {citation['cited_text']}" for citation in content['citations']]))

    texts = " ".join(text)
    cited_texts = " ".join(cited_text)

    return texts, cited_texts


@method_decorator(csrf_exempt, name='dispatch')
class RuleExtractionAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:

            client = anthropic.Anthropic(api_key=os.getenv("ANTHROPIC_API_KEY"))
            
            user_prompt = """
            I'm creating a system to analyze medical research. It processes peer-reviewed papers to extract key details

            Act as a seasoned physician or medical professional who treat patients with bipolar disorder

            Identify rules for medication inclusion or exclusion based on medical history or concerns 

            Return an output with the same structure as these examples:

            The rule is history of suicide attempts. The type of rule is "INCLUDE". The reason is lithium is the 
            only medication on the market that has been proven to reduce suicidality in patients with bipolar disorder.
            The medications for this rule are lithium.

            The rule is weight gain concerns. The type of rule is "EXCLUDE". The reason is Seroquel, Risperdal, Abilify, and 
            Zyprexa are known for causing weight gain. The medications for this rule are Quetiapine, Aripiprazole, Olanzapine, Risperidone
            }
            """

            guid = request.query_params.get('guid')

            query = Embeddings.objects.filter(upload_file__guid=guid)

            chunks = [{"type": "text", "text": chunk.text} for chunk in query]

            texts, cited_texts = anthropic_citations(client, chunks, user_prompt)


            return Response({"texts": texts, "cited_texts": cited_texts}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)