from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, serializers as drf_serializers
from django.http import StreamingHttpResponse
from drf_spectacular.utils import extend_schema, inline_serializer, OpenApiParameter
from ...services.embedding_services import get_closest_embeddings
from ...services.conversions_services import convert_uuids
from ...services.openai_services import openAIServices
from ...services.prompt_services import EMBEDDINGS_SYSTEM_PROMPT_TEMPLATE
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
import json


@method_decorator(csrf_exempt, name='dispatch')
class AskEmbeddingsAPIView(APIView):
    permission_classes = [IsAuthenticated]

    @extend_schema(
        parameters=[
            OpenApiParameter(name='guid', type=str, location=OpenApiParameter.QUERY, required=False, description='Optional file GUID to filter embeddings'),
            OpenApiParameter(name='stream', type=bool, location=OpenApiParameter.QUERY, required=False, description='Enable streaming response'),
        ],
        request=inline_serializer(name='AskEmbeddingsRequest', fields={
            'message': drf_serializers.CharField(help_text='Question to ask against embedded documents'),
        }),
        responses={
            200: inline_serializer(name='AskEmbeddingsResponse', fields={
                'question': drf_serializers.CharField(),
                'llm_response': drf_serializers.CharField(),
                'embeddings_info': drf_serializers.CharField(),
                'sent_to_llm': drf_serializers.CharField(),
            }),
            400: inline_serializer(name='AskEmbeddingsBadRequest', fields={
                'error': drf_serializers.CharField(),
            }),
        }
    )
    def post(self, request, *args, **kwargs):
        try:
            user = request.user
            guid = request.query_params.get('guid')
            stream = request.query_params.get(
                'stream', 'false').lower() == 'true'

            request_data = request.data.get('message', None)
            if not request_data:
                return Response({"error": "Message data is required."}, status=status.HTTP_400_BAD_REQUEST)
            message = str(request_data)

            embeddings_results = get_closest_embeddings(
                user=user, message_data=message, guid=guid)
            embeddings_results = convert_uuids(embeddings_results)

            prompt_texts = [
                f"[Start of INFO {i+1} === GUID: {obj['file_id']}, Page Number: {obj['page_number']}, Chunk Number: {obj['chunk_number']}, Text: {obj['text']} === End of INFO {i+1} ]" for i, obj in enumerate(embeddings_results)]

            listOfEmbeddings = " ".join(prompt_texts)

            prompt_text = EMBEDDINGS_SYSTEM_PROMPT_TEMPLATE.format(listOfEmbeddings=listOfEmbeddings)

            if stream:
                def stream_generator():
                    try:
                        last_chunk = ""
                        for chunk in openAIServices.openAI(message, prompt_text, stream=True, raw_stream=False):
                            # Format as Server-Sent Events for better client handling
                            if chunk and chunk != last_chunk:
                                last_chunk = chunk
                                yield f"data: {json.dumps({'content': chunk})}\n\n"

                        # Send end-of-stream marker
                        yield f"data: {json.dumps({'done': True})}\n\n"

                    except Exception as e:
                        error_data = json.dumps({"error": str(e)})
                        yield f"data: {error_data}\n\n"

                response = StreamingHttpResponse(
                    stream_generator(),
                    content_type='text/event-stream'
                )
                # Add CORS and caching headers for streaming
                response['Cache-Control'] = 'no-cache'
                response['Access-Control-Allow-Origin'] = '*'
                # Disable nginx buffering if behind nginx
                response['X-Accel-Buffering'] = 'no'
                return response
            # Non-streaming response
            answer = openAIServices.openAI(
                userMessage=message,
                prompt=prompt_text,
                stream=False
            )
            return Response({
                "question": message,
                "llm_response": answer,
                "embeddings_info": listOfEmbeddings,
                "sent_to_llm": prompt_text,
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
