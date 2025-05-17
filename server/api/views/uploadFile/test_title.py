import fitz
import os

import unittest
from os import listdir
from os.path import isfile, join

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

  def test_australasian_psychiatry(self):
    with fitz.open("./testdata/creativitystabilizer.pdf") as doc:
      expected_title = "Impact of mood stabilizers on creativity"
      self.assertEqual(expected_title, generate_title(doc))

  def test_remaining(self):
    uploads_dir  = "~/Documents/balancer/uploads"

    # iterate over the files in uploads_dir
    # Expand the ~ to the actual home directory path
    expanded_path = os.path.expanduser(uploads_dir)
    
    # Get all files in the directory
    onlyfiles = [f for f in listdir(expanded_path) if isfile(join(expanded_path, f))]
    
    # Filter for PDF files
    pdf_files = [f for f in onlyfiles if f.lower().endswith('.pdf')]

    for pdf_file in pdf_files:
      file_path = join(expanded_path, pdf_file)
      with fitz.open(file_path) as doc:
        title = generate_title(doc)
        # Print the filename and its generated title for debugging
        print(f"File: {pdf_file}, Title: {title}")
        # Assert that a title is generated (not empty)
        self.assertIsNotNone(title)
        self.assertNotEqual("", title)

