from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import api_view
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from django.http import JsonResponse
from bs4 import BeautifulSoup
from nltk.stem import PorterStemmer
import requests
import openai
import tiktoken
import os
import json
from api.views.ai_settings.models import AI_Settings
from api.views.ai_promptStorage.models import AI_PromptStorage
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

@api_view(['POST'])
def chatgpt1(request) -> Response:
    openai.api_key = os.environ.get("OPENAI_API_KEY")

    guid = request.query_params.get('guid')

    if guid:
        try:
            prompt_storage = AI_PromptStorage.objects.get(guid=guid)
        except AI_PromptStorage.DoesNotExist:
            return Response({"error": "Prompt text not found for the provided GUID."}, status=404)
    else:
        try:
            setting = AI_Settings.objects.get(SettingValue='System Prompt')
            prompt_storage = AI_PromptStorage.objects.get(
                guid=setting.SettingGUID)
        except (AI_Settings.DoesNotExist, AI_PromptStorage.DoesNotExist) as e:
            return Response({"error": str(e)}, status=404)

    # Print the prompt text to the console
    print(prompt_storage.PromptText)

    data = request.data

    if data:
        message = data.get("message")
        system_prompt = prompt_storage.PromptText

        ai_response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_prompt.format(
                    message=message)}
            ]
        )

        return Response({"message": ai_response})

    return Response({"error": "Failed to retrieve results from ChatGPT."}, status=400)


@csrf_exempt
def chatgpt(request: str) -> JsonResponse:
    """
    Takes a diagnosis and returns a table of the most commonly prescribed medications for that diagnosis.
    """
    openai.api_key = os.environ.get("OPENAI_API_KEY")
    data: dict[str, str] = json.loads(request.body)

    if data is not None:
        diagnosis: str = data["prompt"]
        ai_response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": f"Balancer is a powerful tool for selecting bipolar medication for patients. We are open-source and available for free use. Converstation: {diagnosis}."}
            ]
        )
        return JsonResponse({"message": ai_response})

    return JsonResponse({"error": "Failed to retrieve results from ChatGPT."})


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


@csrf_exempt
def diagnosis(request: str) -> JsonResponse:
    """Takes a diagnosis and returns a table of the most commonly prescribed medications for that diagnosis."""
    openai.api_key = os.environ.get("OPENAI_API_KEY")
    data = json.loads(request.body)

    if data is not None:
        diagnosis = data["diagnosis"]

        ai_response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": """Please provide a table of the most commonly prescribed medications for %s. 
                    The table should be in HTML format, without any <head> tags. It should have a maximum width 
                    of 630px, with a margin of 0 for the top and bottom. The table should consist of two columns: 
                    'Medication Class' and 'Medication Names'. Each cell should have a left padding and a border, 
                    and the text in the 'Medication Class' and 'Medications' cells should be displayed in bold. 
                    No other cells should be bold."""
                    % diagnosis,
                }
            ],
            max_tokens=4000,
        )

        response_data = {"message": ai_response}
        return JsonResponse(response_data)

    # Handle the case when data is None
    return JsonResponse({"error": "Invalid request"})

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

    # @action(detail=True, methods=['post'])
    # def set_default(self, request, pk=None):
    #     new_default = self.get_object()
    #     with transaction.atomic():
    #         # Remove default status from other conversations
    #         self.get_queryset().filter(is_default=True).update(is_default=False)
    #         # Set this conversation as default
    #         new_default.is_default = True
    #         new_default.save()
    #     return Response({"status": "Default conversation set"})

    # @action(detail=True, methods=['post'])
    # def reset(self, request, pk=None):
    #     conversation = self.get_object()
    #     if not conversation.is_default:
    #         return Response({"error": "Can only reset the default conversation"}, status=status.HTTP_400_BAD_REQUEST)
    #     # Delete all messages but keep the conversation
    #     conversation.messages.all().delete()
    #     # Reset the title
    #     conversation.title = "New Conversation"
    #     conversation.save()
    #     return Response({"status": "Conversation reset"})

    @action(detail=True, methods=['post'])
    def continue_conversation(self, request, pk=None):
        conversation = self.get_object()
        user_message = request.data.get('message')
        page_context = request.data.get('page_context')

        if not user_message:
            return Response({"error": "Message is required"}, status=400)

        # Save user message
        Message.objects.create(conversation=conversation, content=user_message, is_user=True)

        # Get ChatGPT response
        chatgpt_response = self.get_chatgpt_response(conversation, user_message, page_context)

        # Save ChatGPT response
        Message.objects.create(conversation=conversation, content=chatgpt_response, is_user=False)

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
        messages = [
            {"role": "system", "content": "You are a helpful assistant. Balancer is a powerful tool for selecting bipolar medication for patients. We are open-source and available for free use. Your primary role is to assist users with information related to Balancer and bipolar medication selection."}
        ]
        
        if page_context:
            context_message = f"If applicable, please use the following content to ask questions. If not applicable, please answer to the best of your ability: {page_context}"
            messages.append({"role": "system", "content": context_message})

        for msg in conversation.messages.all():
            role = "user" if msg.is_user else "assistant"
            messages.append({"role": role, "content": msg.content})

        messages.append({"role": "user", "content": user_message})

        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",
            messages=messages
        )

        return response.choices[0].message['content']

    def generate_title(self, conversation):
        messages = conversation.messages.all()[:2]  # Get the first two messages
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