#! /usr/bin/python3

import os
from pathlib import Path
import json
import sys

import fitz

def generate_upload_title(doc) -> str:
  # Check document metadata for a title.
  document_title = doc.metadata["title"]
  pass

with fitz.open(sys.argv[1]) as doc:
  generate_upload_title(doc)
