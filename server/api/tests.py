from django.test import TestCase, Client
from unittest.mock import patch
import json

class ChatGPTViewTest(TestCase):

    def setUp(self):
        self.client = Client()

    @patch('api.views.chatgpt.openai.ChatCompletion.create')
    def test_dynamic_prompts_returned(self, mock_chat):
        # Mocking the ChatGPT response
        mock_chat.return_value = {"choices": [{"content": "Mocked ChatGPT response"}]}

        # Making a post request to your chatgpt view
        response = self.client.post('/chatgpt/chat', json.dumps({'prompt': 'Hello'}), content_type='application/json')

        # Checking if the response contains dynamic prompts
        self.assertIn('newPrompts', response.json())
        self.assertIsInstance(response.json()['newPrompts'], list)
