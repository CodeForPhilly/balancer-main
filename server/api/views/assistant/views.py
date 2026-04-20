import os
import json
import logging
import time
from typing import Callable

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers

from openai import OpenAI

from ...services.embedding_services import get_closest_embeddings
from ...services.conversions_services import convert_uuids

# Configure logging
logger = logging.getLogger(__name__)


# TODO: OpenAI API Dashboard has total duration and cost metrics  
# GPT_5_NANO_PRICING_DOLLARS_PER_MILLION_TOKENS = {"input": 0.05, "output": 0.40}

# def calculate_cost_metrics(token_usage: dict, pricing: dict) -> dict:
#     """
#     Calculate cost metrics based on token usage and pricing

#     Args:
#         token_usage: Dictionary containing input_tokens and output_tokens
#         pricing: Dictionary containing input and output pricing per million tokens

#     Returns:
#         Dictionary containing input_cost, output_cost, and total_cost in USD
#     """
#     TOKENS_PER_MILLION = 1_000_000

#     # Pricing is in dollars per million tokens
#     input_cost_dollars = (pricing["input"] / TOKENS_PER_MILLION) * token_usage.get(
#         "input_tokens", 0
#     )
#     output_cost_dollars = (pricing["output"] / TOKENS_PER_MILLION) * token_usage.get(
#         "output_tokens", 0
#     )
#     total_cost_dollars = input_cost_dollars + output_cost_dollars

#     return {
#         "input_cost": input_cost_dollars,
#         "output_cost": output_cost_dollars,
#         "total_cost": total_cost_dollars,
#     }


@method_decorator(csrf_exempt, name="dispatch")
class Assistant(APIView):
    permission_classes = [AllowAny]

    @extend_schema(
        request=inline_serializer(name='AssistantRequest', fields={
            'message': drf_serializers.CharField(help_text='User message to send to the assistant'),
            'previous_response_id': drf_serializers.CharField(required=False, allow_null=True, help_text='ID of previous response for conversation continuity'),
        }),
        responses={
            200: inline_serializer(name='AssistantResponse', fields={
                'response_output_text': drf_serializers.CharField(),
                'final_response_id': drf_serializers.CharField(),
            }),
            500: inline_serializer(name='AssistantError', fields={
                'error': drf_serializers.CharField(),
            }),
        }
    )
    def post(self, request):
        try:
            user = request.user
    
            message = request.data.get("message", None)
            previous_response_id = request.data.get("previous_response_id", None)
            
            = run_assistant()


            return Response(
                {
                    "response_output_text": final_response_output_text,
                    "final_response_id": final_response_id,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(
                f"Unexpected error in Assistant view for user {request.user.id if hasattr(request, 'user') else 'unknown'}: {e}",
                exc_info=True,
            )
            return Response(
                {"error": "An unexpected error occurred. Please try again later."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
