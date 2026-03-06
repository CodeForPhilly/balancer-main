import re

import fitz

from api.services.openai_services import openAIServices


# regular expression to match common research white paper titles. Created by Chat-gpt
# requires at least 3 words, no version numbers.
title_regex = re.compile(
    r"^(?=(?:\b\w+\b[^A-Za-z0-9]*){3,})(?!.*\bv\d+\b)[A-Za-z0-9].+[A-Za-z\)?!]$", re.IGNORECASE)


def generate_title(pdf: fitz.Document) -> str | None:
    document_metadata_title = pdf.metadata["title"]
    if document_metadata_title is not None and document_metadata_title != "":
        if title_regex.match(document_metadata_title):
            return document_metadata_title.strip()

    font_title = extract_title_by_font_size(pdf)
    if font_title:
        return font_title

    gpt_title = summarize_pdf(pdf)
    return gpt_title or None


def extract_title_by_font_size(pdf: fitz.Document, max_pages: int = 3) -> str | None:
    """
    Extract the title by finding the largest font size across the first few pages
    and collecting contiguous runs of text at that size.
    """
    pages_to_scan = min(max_pages, len(pdf))

    # First pass: collect all spans with their font size, and find the max font size.
    all_spans = []
    max_font_size = 0.0

    for page_idx in range(pages_to_scan):
        page_dict = pdf[page_idx].get_text("dict")
        for block in page_dict["blocks"]:
            if block.get("type") != 0:
                continue
            for line in block["lines"]:
                for span in line["spans"]:
                    text = span["text"].strip()
                    size = span["size"]
                    if len(text) < 2 or size < 6.0:
                        continue
                    all_spans.append({"text": text, "size": size})
                    if size > max_font_size:
                        max_font_size = size

    if max_font_size == 0.0:
        return None

    # Second pass: gather contiguous runs of spans at the max font size.
    # Runs continue across block boundaries so multi-block titles (e.g.,
    # "BIPOLAR DISORDER IN PRIMARY CARE:" in one block and "DIAGNOSIS AND
    # MANAGEMENT" in the next) are joined into a single candidate.
    # A run only ends when a non-max-size span interrupts it.
    candidates = []
    current_run = []

    for span in all_spans:
        if span["size"] == max_font_size:
            current_run.append(span["text"])
        else:
            if current_run:
                candidates.append(" ".join(current_run))
                current_run = []

    if current_run:
        candidates.append(" ".join(current_run))

    # Collapse extra whitespace, validate against title regex, and pick the longest match.
    # Longest wins because real titles are typically longer than section headers
    # (e.g., "About the Author") that may share the same max font size.
    best = None
    for candidate in candidates:
        cleaned = re.sub(r"\s{2,}", " ", candidate).strip()
        if title_regex.match(cleaned):
            if best is None or len(cleaned) > len(best):
                best = cleaned

    if best:
        return best[:255]

    return None


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
    response = openAIServices.openAI(
        first_page_content, prompt, model='gpt-4o', temp=0.0)
    title = response.choices[0].message.content.strip().strip('"').strip("'")
    # Truncate to fit UploadFile model's max_length=255 title field as a final safeguard
    return title[:255]
