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
    
            # TODO: validate message and return a 400 when it is omitted or blank.
            # @extend_schema documents message as required, but that schema is not
            # enforced at runtime, so a missing/empty message reaches run_assistant
            # and becomes the literal string "None" (str(None)) in the model input —
            # producing confusing model behavior. Add a 400 to the responses schema
            # when implementing.
            message = request.data.get("message", None)
            previous_response_id = request.data.get("previous_response_id", None)
            
            final_response_output_text, final_response_id = run_assistant(
                message=message,
                user=user,
                previous_response_id=previous_response_id,
            )

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
