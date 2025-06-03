import re

import fitz

from ...services.openai_services import openAIServices

title_regex = re.compile(r'^([a-z0-9:-]+\s?)+$', re.IGNORECASE)

def generate_title(pdf: fitz.Document) -> str | None:
    # 1. Check the Document's metadata first, likely to be the highest quality title if present.
    document_metadata_title = pdf.metadata["title"]
    if document_metadata_title is not None and document_metadata_title != "":
        if title_regex.match(document_metadata_title):
            print("suitable title was found in metadata")
            return document_metadata_title.strip()

    print("Looking for title in first page text blocks")
    # 2. Find the first text-block which matches the title regex - likely to be on the first page.
    first_page = pdf[0]
    first_page_blocks = first_page.get_text("blocks")
    text_blocks = [block[4].replace('\n', '').strip() for block in first_page_blocks if block[6] == 0]
    if len(text_blocks) != 0:
        for text in text_blocks:
            if title_regex.match(text):
                print("suitable title was found in first page text blocks")
                return text

    print("falling back to chatgpt")
    gpt_title = summarize_pdf(pdf)
    return gpt_title or None


def summarize_pdf(pdf: fitz.Document) -> str:
    first_page = pdf[0]
    first_page_content = first_page.get_text()

    if first_page_content is None:
        raise Exception("Failed to read the first page of the PDF file")

    # UploadFile model title is limited to 255 chars.
    prompt = "Please provide a title for this document. The title should be less than 256 characters and will be displayed on a webpage."
    service = openAIServices()
    response = service.prompt_with_context(first_page_content, prompt, model='gpt-4o', temp=0.0)
    return response.choices[0].message.content
