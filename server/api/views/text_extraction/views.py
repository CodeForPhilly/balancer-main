import os
from ...services.openai_services import openAIServices
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import anthropic
import json
import re
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
            text.append(" ".join(
                [f"<{citation['start_block_index']} - {citation['end_block_index']}>" for citation in content['citations']]))
            cited_text.append(" ".join(
                [f"<{citation['start_block_index']} - {citation['end_block_index']}> {citation['cited_text']}" for citation in content['citations']]))

    texts = " ".join(text)
    cited_texts = " ".join(cited_text)

    return texts, cited_texts


@method_decorator(csrf_exempt, name='dispatch')
class RuleExtractionAPIView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:

            client = anthropic.Anthropic(
                api_key=os.getenv("ANTHROPIC_API_KEY"))

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

            texts, cited_texts = anthropic_citations(
                client, chunks, user_prompt)

            return Response({"texts": texts, "cited_texts": cited_texts}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# This is to use openai to extract the rules to save cost

def openai_extraction(content_chunks, user_prompt):
    """
    Prepares the OpenAI input and returns the extracted text.
    """

    combined_text = "\n\n".join(chunk['text'] for chunk in content_chunks)

    result = openAIServices.openAI(
        userMessage=combined_text,
        prompt=user_prompt,
        model="gpt-4o-mini",
        temp=0.0,
        stream=False
    )
    return result


@method_decorator(csrf_exempt, name='dispatch')
class RuleExtractionAPIOpenAIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_prompt = """
            You're analyzing medical text from multiple sources. Each chunk is labeled [chunk-X].

            Act as a seasoned physician or medical professional who treats patients with bipolar disorder.

            Identify rules for medication inclusion or exclusion based on medical history or concerns.

            For each rule you find, return a JSON object using the following format:

            {
              "rule": "<condition or concern>",
              "type": "INCLUDE" or "EXCLUDE",
              "reason": "<short explanation for why this rule applies>",
              "medications": ["<medication 1>", "<medication 2>", ...],
              "source": "<chunk-X>"
            }

            Only include rules that are explicitly stated or strongly implied in the chunk.

            Only use the chunks provided. If no rule is found in a chunk, skip it.

            Return the entire output as a JSON array.
            """

            guid = request.query_params.get('guid')
            query = Embeddings.objects.filter(upload_file__guid=guid)
            chunks = [
                {"type": "text", "text": f"[chunk-{i}] {chunk.text}"}
                for i, chunk in enumerate(query)
            ]

            output_text = openai_extraction(chunks, user_prompt)
            cleaned_text = re.sub(r"^```json|```$", "",
                                  output_text.strip()).strip()
            rules = json.loads(cleaned_text)

            # Attach chunk_number and chunk_text to each rule
            chunk_lookup = {f"chunk-{i}": chunk.text for i,
                            chunk in enumerate(query)}
            for rule in rules:
                source = rule.get("source", "").strip("[]")  # e.g. chunk-63
                if source.startswith("chunk-"):
                    chunk_number = int(source.replace("chunk-", ""))
                    rule["chunk_number"] = chunk_number
                    rule["chunk_text"] = chunk_lookup.get(source, "")

            return Response({"rules": rules}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
