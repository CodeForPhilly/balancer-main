import re
import json

import fitz

def generate_title(doc: fitz.Document) -> str:
  # Check the Document's metadata first, likely to be the highest quality title
  document_title = doc.metadata["title"]
  if document_title != None and document_title != "":
    return document_title.strip()

  # TODO: Ask the model for a summary title? Use the first page for context?
  # Look for the first "title" on the first page.
  first_page_blocks = doc[0].get_text("blocks")

  text_blocks = [block[4].replace('\n', '').strip() for block in first_page_blocks if block[6] == 0]
  if len(text_blocks) != 0:
    title_regex = re.compile("/^[\\w]+\\s*$/")
    for text in text_blocks:
      if title_regex.match(text):
        return text

  print(json.dumps(text_blocks, indent=4))
