import unittest
from unittest.mock import MagicMock, patch

from . import title


class TestGenerateTitle(unittest.TestCase):
    def test_prefers_metadata_title_if_valid(self):
        doc = MagicMock()
        doc.metadata = {"title": "A Study Regarding The Efficacy of Drugs"}
        self.assertEqual(
            "A Study Regarding The Efficacy of Drugs", title.generate_title(doc))

    def test_falls_back_to_first_page_text_if_metadata_title_is_empty(self):
        doc = MagicMock()
        doc.metadata = {"title": ""}
        doc[0].get_text = MagicMock()

        foo_block = [None] * 7
        foo_block[4] = "foo"
        foo_block[6] = 0

        title_block = [None] * 7
        title_block[4] = "Advances in Mood Disorder Pharmacotherapy: Evaluating New Antipsychotics and Mood Stabilizers for Bipolar Disorder and Schizophrenia"
        title_block[6] = 0

        bar_block = [None] * 7
        bar_block[4] = "bar"
        bar_block[6] = 0
        doc[0].get_text.return_value = [foo_block, title_block, bar_block]

        expected_title = "Advances in Mood Disorder Pharmacotherapy: Evaluating New Antipsychotics and Mood Stabilizers for Bipolar Disorder and Schizophrenia"
        self.assertEqual(expected_title, title.generate_title(doc))

    def test_falls_back_to_first_page_text_if_metadata_title_does_not_match_regex(self):
        doc = MagicMock()
        doc.metadata = {"title": "abcd1234"}
        doc[0].get_text = MagicMock()

        foo_block = [None] * 7
        foo_block[4] = "foo"
        foo_block[6] = 0

        title_block = [None] * 7
        title_block[4] = "Advances in Mood Disorder Pharmacotherapy: Evaluating New Antipsychotics and Mood Stabilizers for Bipolar Disorder and Schizophrenia"
        title_block[6] = 0

        bar_block = [None] * 7
        bar_block[4] = "bar"
        bar_block[6] = 0
        doc[0].get_text.return_value = [foo_block, title_block, bar_block]

        expected_title = "Advances in Mood Disorder Pharmacotherapy: Evaluating New Antipsychotics and Mood Stabilizers for Bipolar Disorder and Schizophrenia"
        self.assertEqual(expected_title, title.generate_title(doc))

    @patch("api.views.uploadFile.title.openAIServices.openAI")
    def test_falls_back_to_chatgpt_if_no_title_found(self, mock_openAI):
        doc = MagicMock()
        doc.metadata = {"title": None}
        doc[0].get_text.return_value = []

        mock_openAI.return_value = "A Study Regarding The Efficacy of Drugs"

        title.generate_title(doc)

        self.assertTrue(mock_openAI.called)

    @patch("api.views.uploadFile.title.openAIServices.openAI")
    def test_strips_quotes_from_openai_title(self, mock_openAI):
        doc = MagicMock()
        doc.metadata = {"title": None}
        doc[0].get_text.return_value = []

        mock_openAI.return_value = '"Updated CANMAT/ISBD Guidelines for Treating Mixed Features in Bipolar Disorder"'

        result = title.generate_title(doc)

        self.assertEqual(result, "Updated CANMAT/ISBD Guidelines for Treating Mixed Features in Bipolar Disorder")

    @patch("api.views.uploadFile.title.openAIServices.openAI")
    def test_truncates_long_openai_title(self, mock_openAI):
        doc = MagicMock()
        doc.metadata = {"title": None}
        doc[0].get_text.return_value = []

        mock_openAI.return_value = "A" * 300

        result = title.generate_title(doc)

        # Ensure the title is truncated to fit the UploadFile model's title field (max_length=255), since OpenAI responses may exceed this limit
        self.assertLessEqual(len(result), 255)
