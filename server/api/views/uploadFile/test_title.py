import fitz

import unittest

from title import generate_title

class TestGenerateTitle(unittest.TestCase):
  # TODO: Good use for parameterized tests.
  def test_prefers_metadata_title(self):
    with fitz.open("./testdata/lithium-longterm.pdf") as doc:
      self.assertEqual("Long-Term Lithium Therapy: Side Effects and Interactions", generate_title(doc))
      pass

  def test_falls_back_to_first_sentence(self):
    with fitz.open("./testdata/advancespharmaco.pdf") as doc:
      expected_title = "Advances in Mood Disorder Pharmacotherapy: Evaluating New Antipsychotics and Mood Stabilizers for Bipolar Disorder and Schizophrenia"
      self.assertEqual(expected_title, generate_title(doc))
