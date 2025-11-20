# services/embedding_services.py

import time
import logging
from pgvector.django import L2Distance

from .sentencetTransformer_model import TransformerModel

# Adjust import path as needed
from ..models.model_embeddings import Embeddings

# Configure logging
logger = logging.getLogger(__name__)


def get_closest_embeddings(
    user, message_data, document_name=None, guid=None, num_results=10, return_metrics=False
):
    """
    Find the closest embeddings to a given message for a specific user.

    Parameters
    ----------
    user : User
        The user whose uploaded documents will be searched
    message_data : str
        The input message to find similar embeddings for
    document_name : str, optional
        Filter results to a specific document name
    guid : str, optional
        Filter results to a specific document GUID (takes precedence over document_name)
    num_results : int, default 10
        Maximum number of results to return
    return_metrics : bool, default False
        If True, return a tuple of (results, metrics) instead of just results

    Returns
    -------
    list[dict] or tuple[list[dict], dict]
        If return_metrics is False (default):
            List of dictionaries containing embedding results with keys:
            - name: document name
            - text: embedded text content
            - page_number: page number in source document
            - chunk_number: chunk number within the document
            - distance: L2 distance from query embedding
            - file_id: GUID of the source file

        If return_metrics is True:
            Tuple of (results, metrics) where metrics is a dictionary containing:
            - encoding_time: Time to encode query (seconds)
            - db_query_time: Time for database query (seconds)
            - total_time: Total execution time (seconds)
            - total_embeddings: Number of embeddings searched
            - num_results_returned: Number of results returned
            - avg_similarity: Average similarity score (0-1)
            - min_distance: Minimum L2 distance
            - max_distance: Maximum L2 distance
            - avg_distance: Average L2 distance
    """

    # Track total execution time
    start_time = time.time()

    # Track transformer encoding time
    encoding_start = time.time()
    transformerModel = TransformerModel.get_instance().model
    embedding_message = transformerModel.encode(message_data)
    encoding_time = time.time() - encoding_start

    # Track database query time
    db_query_start = time.time()

    # Start building the query based on the message's embedding
    closest_embeddings_query = (
        Embeddings.objects.filter(upload_file__uploaded_by=user)
        .annotate(
            distance=L2Distance("embedding_sentence_transformers", embedding_message)
        )
        .order_by("distance")
    )

    # Get total embeddings in search space before filtering
    total_embeddings = closest_embeddings_query.count()

    # Filter by GUID if provided, otherwise filter by document name if provided
    if guid:
        closest_embeddings_query = closest_embeddings_query.filter(
            upload_file__guid=guid
        )
    elif document_name:
        closest_embeddings_query = closest_embeddings_query.filter(name=document_name)

    # Slice the results to limit to num_results
    closest_embeddings_query = closest_embeddings_query[:num_results]

    # Format the results to be returned
    results = [
        {
            "name": obj.name,
            "text": obj.text,
            "page_number": obj.page_num,
            "chunk_number": obj.chunk_number,
            "distance": obj.distance,
            "file_id": obj.upload_file.guid if obj.upload_file else None,
        }
        for obj in closest_embeddings_query
    ]

    db_query_time = time.time() - db_query_start
    total_time = time.time() - start_time

    # Calculate distance/similarity statistics
    num_results_returned = len(results)
    if num_results_returned > 0:
        distances = [r["distance"] for r in results]
        min_distance = min(distances)
        max_distance = max(distances)
        avg_distance = sum(distances) / num_results_returned
        # Convert distance to similarity score (1 - distance for L2)
        avg_similarity = 1 - avg_distance
    else:
        min_distance = max_distance = avg_distance = avg_similarity = 0.0

    # Log performance metrics similar to assistant/views.py pattern
    logger.info(
        f"Embedding search completed: "
        f"Encoding time: {encoding_time:.3f}s, "
        f"DB query time: {db_query_time:.3f}s, "
        f"Total time: {total_time:.3f}s, "
        f"Searched: {total_embeddings} embeddings, "
        f"Returned: {num_results_returned} results, "
        f"Avg similarity: {avg_similarity:.3f}, "
        f"Distance range: [{min_distance:.3f}, {max_distance:.3f}]"
    )

    # Optionally return metrics along with results
    if return_metrics:
        metrics = {
            "encoding_time": encoding_time,
            "db_query_time": db_query_time,
            "total_time": total_time,
            "total_embeddings": total_embeddings,
            "num_results_returned": num_results_returned,
            "avg_similarity": avg_similarity,
            "min_distance": min_distance,
            "max_distance": max_distance,
            "avg_distance": avg_distance,
        }
        return results, metrics

    return results
