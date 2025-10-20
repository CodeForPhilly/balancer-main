import json
import re

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt

from ...services.openai_services import openAIServices
from ...services.prompt_services import PromptTemplates
from api.models.model_embeddings import Embeddings

# This is to use openai to extract the rules to save cost


def openai_extraction(content_chunks, user_prompt):
    """
    Prepares the OpenAI input and returns the extracted text.
    """

    combined_text = "\n\n".join(chunk["text"] for chunk in content_chunks)

    result = openAIServices.openAI(
        userMessage=combined_text,
        prompt=user_prompt,
        model="gpt-4o-mini",
        temp=0.0,
        stream=False,
    )
    return result


@method_decorator(csrf_exempt, name="dispatch")
class RuleExtractionAPIOpenAIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        try:
            user_prompt = PromptTemplates.get_text_extraction_prompt()

            guid = request.query_params.get("guid")
            query = Embeddings.objects.filter(upload_file__guid=guid)
            chunks = [
                {"type": "text", "text": f"[chunk-{i}] {chunk.text}"}
                for i, chunk in enumerate(query)
            ]

            output_text = openai_extraction(chunks, user_prompt)
            cleaned_text = re.sub(r"^```json|```$", "", output_text.strip()).strip()
            rules = json.loads(cleaned_text)

            # Attach chunk_number and chunk_text to each rule
            chunk_lookup = {f"chunk-{i}": chunk.text for i, chunk in enumerate(query)}
            for rule in rules:
                source = rule.get("source", "").strip("[]")  # e.g. chunk-63
                if source.startswith("chunk-"):
                    chunk_number = int(source.replace("chunk-", ""))
                    rule["chunk_number"] = chunk_number
                    rule["chunk_text"] = chunk_lookup.get(source, "")

            return Response({"rules": rules}, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
