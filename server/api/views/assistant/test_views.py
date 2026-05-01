from unittest.mock import patch

from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient

User = get_user_model()


class AssistantViewTest(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/v1/api/assistant/"

    @patch("api.views.assistant.views.run_assistant")
    def test_returns_200_with_response_fields(self, mock_run_assistant):
        mock_run_assistant.return_value = ("Lithium is recommended.", "resp-abc-123")

        response = self.client.post(
            self.url,
            {"message": "What medications help with bipolar depression?"},
            format="json",
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data["response_output_text"], "Lithium is recommended.")
        self.assertEqual(response.data["final_response_id"], "resp-abc-123")

    @patch("api.views.assistant.views.run_assistant")
    def test_passes_message_and_user_to_run_assistant(self, mock_run_assistant):
        mock_run_assistant.return_value = ("Some response.", "resp-xyz")

        self.client.post(
            self.url,
            {"message": "Tell me about lithium."},
            format="json",
        )

        call_kwargs = mock_run_assistant.call_args.kwargs
        self.assertEqual(call_kwargs["message"], "Tell me about lithium.")
        self.assertIn("user", call_kwargs)
        self.assertIsNone(call_kwargs["previous_response_id"])

    @patch("api.views.assistant.views.run_assistant")
    def test_passes_previous_response_id_when_provided(self, mock_run_assistant):
        mock_run_assistant.return_value = ("Follow-up response.", "resp-456")

        self.client.post(
            self.url,
            {"message": "Tell me more.", "previous_response_id": "resp-123"},
            format="json",
        )

        call_kwargs = mock_run_assistant.call_args.kwargs
        self.assertEqual(call_kwargs["previous_response_id"], "resp-123")

    @patch("api.views.assistant.views.run_assistant", side_effect=Exception("OpenAI error"))
    def test_returns_500_on_exception(self, mock_run_assistant):
        response = self.client.post(
            self.url,
            {"message": "What is lithium?"},
            format="json",
        )

        self.assertEqual(response.status_code, 500)
        self.assertIn("error", response.data)
