import logging

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from drf_spectacular.utils import extend_schema, inline_serializer
from rest_framework import serializers as drf_serializers

from api.views.assistant.assistant_services import run_assistant

logger = logging.getLogger(__name__)


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

            # TODO: Missing/empty message reaches run_assistant and becomes the literal string "None" (str(None)) in the model input
            message = request.data.get("message", None)
            previous_response_id = request.data.get("previous_response_id", None)
            
            result = run_assistant(
                user=user,
                message=message,
                previous_response_id=previous_response_id,
            )

            return Response(
                {
                    "response_output_text": result.output_text,
                    "final_response_id": result.response_id,
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
