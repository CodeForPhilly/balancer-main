import re
import json

import fitz

title_regex = re.compile(r'^([a-z0-9:-]+\s?)+$', re.IGNORECASE)

def generate_title(doc: fitz.Document) -> str | None:
  # 1. Check the Document's metadata first, likely to be the highest quality title if present.
  document_metadata_title = doc.metadata["title"]
  if document_metadata_title is not None and document_metadata_title != "":
    if title_regex.match(document_metadata_title):
      return document_metadata_title.strip()

  # 2. Attempt to extract a title from the first page
  first_page = doc[0]
  first_page_blocks = first_page.get_text("blocks")
  text_blocks = [block[4].replace('\n', '').strip() for block in first_page_blocks if block[6] == 0]
  print(json.dumps(text_blocks, indent=4))
  if len(text_blocks) != 0:
    for text in text_blocks:
      if title_regex.match(text):
        return text

  # 3. Fallback, ask ChatGPT :-)
  return None
