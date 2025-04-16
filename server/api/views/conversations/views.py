from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import APIException
from django.http import JsonResponse
from bs4 import BeautifulSoup
from nltk.stem import PorterStemmer
import requests
import openai
import tiktoken
import os
import json
import logging
from api.views.ai_settings.models import AI_Settings
from api.views.ai_promptStorage.models import AI_PromptStorage
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction, connection
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer
from ...services.tools.tools import tools, execute_tool
from ...services.tools.database import get_database_info


@csrf_exempt
def extract_text(request: str) -> JsonResponse:
    """
    Takes a URL and returns a summary of page's text content.

    Currently only uses the first 3500 tokens.
    """
    openai.api_key = os.environ.get("OPENAI_API_KEY")
    data = json.loads(request.body)
    webpage_url = data["webpage_url"]

    response = requests.get(webpage_url)
    soup = BeautifulSoup(response.text, "html.parser")
    text_contents = soup.find_all("p")
    text_contents = [p.get_text() for p in text_contents]
    text_contents = " ".join(text_contents)

    stemmer = PorterStemmer()
    text_contents = text_contents.split()
    text_contents = [stemmer.stem(word) for word in text_contents]
    text_contents = " ".join(text_contents)

    tokens = get_tokens(text_contents, "cl100k_base")

    ai_response = openai.ChatCompletion.create(
        model="gpt-3.5-turbo",
        messages=[
            {
                "role": "system",
                "content": "Give a brief description of this medicine: %s" % tokens,
            }
        ],
        max_tokens=500,
    )

    return JsonResponse({"message": ai_response})


def get_tokens(string: str, encoding_name: str) -> str:
    """Tokenize the first 3500 tokens of a string."""
    encoding = tiktoken.get_encoding(encoding_name)
    tokens = encoding.encode(string)
    tokens = tokens[:3500]
    output_string = encoding.decode(tokens)
    return output_string

class OpenAIAPIException(APIException):
    """Custom exception for OpenAI API errors."""
    status_code = status.HTTP_500_INTERNAL_SERVER_ERROR
    default_detail = "An error occurred while communicating with the OpenAI API."
    default_code = "openai_api_error"

    def __init__(self, detail=None, code=None):
        if detail is not None:
            self.detail = {"error": detail}
        else:
            self.detail = {"error": self.default_detail}
        self.status_code = code or self.status_code

class ConversationViewSet(viewsets.ModelViewSet):
    serializer_class = ConversationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        # Add any custom logic here
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=True, methods=['post'])
    def continue_conversation(self, request, pk=None):
        conversation = self.get_object()
        user_message = request.data.get('message')
        page_context = request.data.get('page_context')

        if not user_message:
            return Response({"error": "Message is required"}, status=400)

        # Save user message
        Message.objects.create(conversation=conversation,
                               content=user_message, is_user=True)

        # Get ChatGPT response
        chatgpt_response = self.get_chatgpt_response(
            conversation, user_message, page_context)

        # Save ChatGPT response
        Message.objects.create(conversation=conversation,
                               content=chatgpt_response, is_user=False)

        # Generate or update title if it's the first message or empty
        if conversation.messages.count() <= 2 or not conversation.title:
            conversation.title = self.generate_title(conversation)
            conversation.save()

        return Response({"response": chatgpt_response, "title": conversation.title})

    @action(detail=True, methods=['patch'])
    def update_title(self, request, pk=None):
        conversation = self.get_object()
        new_title = request.data.get('title')

        if not new_title:
            return Response({"error": "New title is required"}, status=status.HTTP_400_BAD_REQUEST)

        conversation.title = new_title
        conversation.save()

        return Response({"status": "Title updated successfully", "title": conversation.title})

    def get_chatgpt_response(self, conversation, user_message, page_context=None):
        messages = [{
            "role": "system",
            "content": "You are a knowledgeable assistant. Balancer is a powerful tool for selecting bipolar medication for patients. We are open-source and available for free use. Your primary role is to assist licensed clinical professionals with information related to Balancer and bipolar medication selection. If applicable, use the supplied tools to assist the professional."
        }]

        if page_context:
            context_message = f"If applicable, please use the following content to ask questions and support your response with a numbered list of 3 reputable URL sources from peer-reviewed journals. The URL sources must start with 'Sources:', include a line break, follow the APA Citation Style, and at the end a line break followed by a link to the Publication URL. If not applicable, please answer to the best of your ability: {page_context}"
            messages.append({"role": "system", "content": context_message})

        for msg in conversation.messages.all():
            role = "user" if msg.is_user else "assistant"
            messages.append({"role": role, "content": msg.content})

        messages.append({"role": "user", "content": user_message})

        try:
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=messages,
                tools=tools,
                tool_choice="auto"
            )

            response_message = response.choices[0].message
            tool_calls = response_message.get('tool_calls', [])

            if not tool_calls:
                return response_message['content']


            # Handle tool calls
            # Add the assistant's message with tool calls to the conversation
            messages.append({
                "role": "assistant",
                "content": response_message.get('content', ''),
                "tool_calls": tool_calls
            })

            # Process each tool call
            for tool_call in tool_calls:
                tool_call_id = tool_call['id']
                tool_function_name = tool_call['function']['name']
                tool_arguments = json.loads(tool_call['function'].get('arguments', '{}'))

                # Execute the tool
                results = execute_tool(tool_function_name, tool_arguments)

                # Add the tool response message
                messages.append({
                    "role": "tool",
                    "content": str(results),  # Convert results to string
                    "tool_call_id": tool_call_id
                })

            # Final API call with tool results
            final_response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                    messages=messages
                )
            return final_response.choices[0].message['content']
        except openai.error.OpenAIError as e:
            logging.error("OpenAI API Error: %s", str(e))
            raise OpenAIAPIException(detail=str(e))
        except Exception as e:
            logging.error("Unexpected Error: %s", str(e))
            raise OpenAIAPIException(detail="An unexpected error occurred.")

    def generate_title(self, conversation):
        # Get the first two messages
        messages = conversation.messages.all()[:2]
        context = "\n".join([msg.content for msg in messages])
        prompt = f"Based on the following conversation, generate a short, descriptive title (max 6 words):\n\n{context}"

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant that generates short, descriptive titles."},
                {"role": "user", "content": prompt}
            ]
        )

        return response.choices[0].message['content'].strip()
