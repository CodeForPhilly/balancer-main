#! /usr/bin/python3

import os
from pathlib import Path
import json
import sys

import fitz

def generate_upload_title(doc) -> str:
  # Check document metadata for a title. First choice, probably set explicitly by the author
  document_title = doc.metadata["title"]
  if document_title != None and document_title != "":
    return document_title

  print("document title was empty, searching first page for title")
  first_page = doc[0]
  first_page_blocks = first_page.get_text("blocks")

  text_blocks = [
    # Clean string, replace \n with a single space
    block[4].replace('\n', '').strip()
    # only take text blocks
    if block[6] == 0 else None
    for block in first_page_blocks]
  print(text_blocks)

  titleRegex = "/^[\\w]+\\s*$/"
  # Find the first text block which matches the "title" regex

  print(json.dumps(first_page_blocks, indent=4))

if len(sys.argv) != 2:
  print("missing filepath")
  sys.exit(1)

# with fitz.open(sys.argv[1]) as doc:
#   print("title: {}".format(generate_upload_title(doc)))

with open(sys.argv[1], "rb") as file:
  with fitz.open(stream=file.read(), filetype="pdf") as doc:
    print("title: {}".format(generate_upload_title(doc)))
