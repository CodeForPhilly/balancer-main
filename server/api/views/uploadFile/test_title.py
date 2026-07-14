import unittest
from unittest.mock import MagicMock, patch

from api.views.uploadFile import title


def make_page_dict(blocks):
    """Helper to build a get_text("dict") return value from a simple list of blocks.
    Each block is a list of (text, font_size) tuples representing spans.
    """
    dict_blocks = []
    for spans in blocks:
        dict_blocks.append({
            "type": 0,
            "lines": [{
                "spans": [{"text": text, "size": size} for text, size in spans]
            }]
        })
    return {"blocks": dict_blocks}


def make_mock_doc(pages_data, metadata=None):
    """Build a mock fitz.Document.
    pages_data: list of block lists, one per page. Each block is a list of (text, size) tuples.
    """
    doc = MagicMock()
    doc.metadata = metadata or {"title": None}
    doc.__len__ = lambda self: len(pages_data)

    mock_pages = []
    for page_blocks in pages_data:
        page = MagicMock()
        page.get_text.return_value = make_page_dict(page_blocks)
        mock_pages.append(page)

    doc.__getitem__ = lambda self, idx: mock_pages[idx]
    return doc


class TestGenerateTitle(unittest.TestCase):
    def test_prefers_metadata_title_if_valid(self):
        doc = MagicMock()
        doc.metadata = {"title": "A Study Regarding The Efficacy of Drugs"}
        self.assertEqual(
            "A Study Regarding The Efficacy of Drugs", title.generate_title(doc))

    def test_falls_back_to_font_size_if_metadata_title_is_empty(self):
        doc = make_mock_doc(
            pages_data=[[
                [("foo", 10.0)],
                [("Advances in Mood Disorder Pharmacotherapy: Evaluating New Antipsychotics and Mood Stabilizers for Bipolar Disorder and Schizophrenia", 18.0)],
                [("bar", 10.0)],
            ]],
            metadata={"title": ""},
        )
        expected_title = "Advances in Mood Disorder Pharmacotherapy: Evaluating New Antipsychotics and Mood Stabilizers for Bipolar Disorder and Schizophrenia"
        self.assertEqual(expected_title, title.generate_title(doc))

    def test_falls_back_to_font_size_if_metadata_title_does_not_match_regex(self):
        doc = make_mock_doc(
            pages_data=[[
                [("foo", 10.0)],
                [("Advances in Mood Disorder Pharmacotherapy: Evaluating New Antipsychotics and Mood Stabilizers for Bipolar Disorder and Schizophrenia", 18.0)],
                [("bar", 10.0)],
            ]],
            metadata={"title": "abcd1234"},
        )
        expected_title = "Advances in Mood Disorder Pharmacotherapy: Evaluating New Antipsychotics and Mood Stabilizers for Bipolar Disorder and Schizophrenia"
        self.assertEqual(expected_title, title.generate_title(doc))

    @patch("api.views.uploadFile.title.openAIServices.openAI")
    def test_falls_back_to_chatgpt_if_no_title_found(self, mock_openAI):
        doc = make_mock_doc(
            pages_data=[[]]  # no blocks at all
        )

        mock_openAI.return_value = "A Study Regarding The Efficacy of Drugs"

        result = title.generate_title(doc)

        self.assertTrue(mock_openAI.called)
        self.assertEqual(result, "A Study Regarding The Efficacy of Drugs")

    @patch("api.views.uploadFile.title.openAIServices.openAI")
    def test_strips_quotes_from_openai_title(self, mock_openAI):
        doc = make_mock_doc(pages_data=[[]])

        mock_openAI.return_value = '"Updated CANMAT/ISBD Guidelines for Treating Mixed Features in Bipolar Disorder"'

        result = title.generate_title(doc)

        self.assertEqual(result, "Updated CANMAT/ISBD Guidelines for Treating Mixed Features in Bipolar Disorder")

    @patch("api.views.uploadFile.title.openAIServices.openAI")
    def test_truncates_long_openai_title(self, mock_openAI):
        doc = make_mock_doc(pages_data=[[]])

        mock_openAI.return_value = "A" * 300

        result = title.generate_title(doc)

        # Ensure the title is truncated to fit the UploadFile model's title field (max_length=255), since OpenAI responses may exceed this limit
        self.assertLessEqual(len(result), 255)

    def test_font_size_joins_adjacent_spans_in_same_block(self):
        """A title split across multiple spans in the same block should be joined."""
        doc = make_mock_doc(
            pages_data=[[
                [("Author Name", 10.0)],
                [("Advances in Mood Disorder", 18.0), ("Pharmacotherapy", 18.0)],
                [("Some journal info", 10.0)],
            ]],
        )
        result = title.extract_title_by_font_size(doc)
        self.assertEqual(result, "Advances in Mood Disorder Pharmacotherapy")

    def test_font_size_ignores_short_spans(self):
        """Superscript markers and other tiny spans should be filtered out."""
        doc = make_mock_doc(
            pages_data=[[
                [("Advances in Mood Disorder Pharmacotherapy", 18.0), ("*", 18.0)],
                [("Author Name et al.", 10.0)],
            ]],
        )
        # The "*" span is < 2 chars, so it should be ignored; title is just the real text
        result = title.extract_title_by_font_size(doc)
        self.assertEqual(result, "Advances in Mood Disorder Pharmacotherapy")

    def test_font_size_returns_none_when_no_regex_match(self):
        """If the largest-font text doesn't match the title regex, return None."""
        doc = make_mock_doc(
            pages_data=[[
                # Only 2 words — regex requires at least 3
                [("Psychiatry Research", 18.0)],
                [("Author Name et al.", 10.0)],
            ]],
        )
        result = title.extract_title_by_font_size(doc)
        self.assertIsNone(result)

    def test_font_size_finds_title_on_later_page(self):
        """Title on page 2 should still be found if it has the largest font."""
        doc = make_mock_doc(
            pages_data=[
                [  # page 1: cover page with smaller text
                    [("Some preamble text here", 12.0)],
                ],
                [  # page 2: actual title in larger font
                    [("Advances in Mood Disorder Pharmacotherapy", 18.0)],
                    [("Author Name et al.", 10.0)],
                ],
            ],
        )
        result = title.extract_title_by_font_size(doc)
        self.assertEqual(result, "Advances in Mood Disorder Pharmacotherapy")
