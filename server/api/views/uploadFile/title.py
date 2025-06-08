import re

import fitz

from server.api.services.openai_services import openAIServices

# regular expression to match common research white paper titles. Created by Chat-gpt
title_regex = re.compile(r'^(?=(?:\b\w+\b[\s:,\-\(\)]*){3,})(?!.*\b(?:19|20)\d{2}\b)(?!.*\bv\d+\b)[A-Za-z0-9][\w\s:,\-\(\)]*[A-Za-z\)]$', re.IGNORECASE)

def generate_title(pdf: fitz.Document) -> str | None:
    document_metadata_title = pdf.metadata["title"]
    if document_metadata_title is not None and document_metadata_title != "":
        if title_regex.match(document_metadata_title):
            print("suitable title was found in metadata")
            return document_metadata_title.strip()

    print("Looking for title in first page text")
    first_page = pdf[0]
    first_page_blocks = first_page.get_text("blocks")
    text_blocks = [
        block[4].strip().replace("\n", " ")
        for block in first_page_blocks
        if block[6] == 0 # only include text blocks.
    ]

    regex = r"\s{2,}"
    text_blocks = [re.sub(regex, " ", text) for text in text_blocks]

    # replace redundant whitespaces with single space.
    if len(text_blocks) != 0:
        for text in text_blocks:
            if title_regex.match(text):
                print(f"suitable title was found in first page text {text}")
                return text

    print("using chatgpt to generate title")
    gpt_title = summarize_pdf(pdf)
    return gpt_title or None


def summarize_pdf(pdf: fitz.Document) -> str:
    """
    Summarize a PDF document using OpenAI's GPT-4 model.
    """
    first_page = pdf[0]
    first_page_content = first_page.get_text()

    if first_page_content is None:
        raise Exception("Failed to read the first page of the PDF file")

    # UploadFile model title is limited to 255 chars.
    prompt = "Please provide a title for this document. The title should be less than 256 characters and will be displayed on a webpage."
    response = openAIServices.openAI(first_page_content, prompt, model='gpt-4o', temp=0.0)
    return response.choices[0].message.content
