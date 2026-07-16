from ...services.embedding_services import get_closest_embeddings
from ...services.conversions_services import convert_uuids


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
        Formatted search results containing document excerpts with metadata

    Raises
    ------
    Exception
        If embedding search fails
    """

    try:
        embeddings_results = get_closest_embeddings(
            user=user, message_data=query.strip()
        )
        embeddings_results = convert_uuids(embeddings_results)

        if not embeddings_results:
            return "No relevant documents found for your query. Please try different search terms or upload documents first."

        # Format results with clear structure and metadata
        prompt_texts = [
            f"[Document {i + 1} - File: {obj['file_id']}, Name: {obj['name']}, Page: {obj['page_number']}, Chunk: {obj['chunk_number']}, Similarity: {1 - obj['distance']:.3f}]\n{obj['text']}\n[End Document {i + 1}]"
            for i, obj in enumerate(embeddings_results)
        ]

        return "\n\n".join(prompt_texts)

    except Exception as e:
        return f"Error searching documents: {str(e)}. Please try again if the issue persists."

        