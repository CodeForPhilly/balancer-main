from api.services.embedding_services import get_closest_embeddings
from api.services.conversions_services import convert_uuids


def search_documents(query: str, user) -> str:
    """
    Search through user's uploaded documents using semantic similarity.

    This function performs vector similarity search against the user's document corpus
    and returns formatted results with context information for the LLM to use.

    Parameters
    ----------
    query : str
        The search query string
    user : User
        The authenticated user whose documents to search

    Returns
    -------
    str
        Formatted search results containing document excerpts with metadata, or a
        message saying nothing matched. Matching nothing is a legitimate outcome,
        not a failure, so it returns normally and the call is recorded as OK.

    Raises
    ------
    Exception
        If the embedding search fails. Deliberately not caught here.
        _execute_function_call (agentic_loop.py) already catches it, records
        the call as ToolCallStatus.FAILED with the error, and still feeds the message
        back to the model so it can retry or say it could not retrieve anything —
        so letting it propagate loses nothing the model was getting before, and the
        failure becomes visible to the eval.

        This used to catch everything and return the error as its result string.
        A returned string is indistinguishable from a successful retrieval, so the
        call was recorded OK, tool_error_count stayed 0, and ToolCallStatus.FAILED
        was unreachable for the only tool the model actually calls.
    """

    embeddings_results = get_closest_embeddings(
        user=user, message_data=query.strip()
    )
    embeddings_results = convert_uuids(embeddings_results)

    if not embeddings_results:
        return "No relevant documents found for your query. Please try different search terms or upload documents first."

    # Format results with clear structure and metadata
    #
    # Drop `File: {obj['file_id']}` from this line — one of the two citation defects
    # blocking any citation-accuracy scoring. This hands the model both a UUID and a human
    # document name and does not say which is the citable one, so it sometimes picks the
    # UUID: the 20260807 eval produced
    # "[Name 4cdd4a7e-0c26-4b80-b685-e731e8670725], Page 3, Chunk 12".
    # The model never needs file_id — nothing downstream resolves it and INSTRUCTIONS asks
    # for {name} — so removing the field removes the ambiguity outright. The sibling defect
    # is in the citation template itself; see the TODO above INSTRUCTIONS in
    # assistant_prompts.py. Both must land before citation accuracy is parseable, which is
    # what the scoring TODO in eval_assistant.py rests on.
    prompt_texts = [
        f"[Document {i + 1} - File: {obj['file_id']}, Name: {obj['name']}, Page: {obj['page_number']}, Chunk: {obj['chunk_number']}, Similarity: {1 - obj['distance']:.3f}]\n{obj['text']}\n[End Document {i + 1}]"
        for i, obj in enumerate(embeddings_results)
    ]

    return "\n\n".join(prompt_texts)
