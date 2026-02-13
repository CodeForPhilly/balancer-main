import time
import logging
from statistics import median

from django.db.models import Q
from pgvector.django import L2Distance

from .sentencetTransformer_model import TransformerModel
from ..models.model_embeddings import Embeddings
from ..models.model_search_usage import SemanticSearchUsage

logger = logging.getLogger(__name__)


def build_query(user, embedding_vector, document_name=None, guid=None, num_results=10):
    """
    Build an unevaluated QuerySet for the closest embeddings.

    Parameters
    ----------
    user : User
        The user whose uploaded documents will be searched
    embedding_vector : array-like
        Pre-computed embedding vector to compare against
    document_name : str, optional
        Filter results to a specific document name
    guid : str, optional
        Filter results to a specific document GUID (takes precedence over document_name)
    num_results : int, default 10
        Maximum number of results to return

    Returns
    -------
    QuerySet
        Unevaluated Django QuerySet ordered by L2 distance, sliced to num_results
    """
    # Django QuerySets are lazily evaluated
    if user.is_authenticated:
        # User sees their own files + files uploaded by superusers
        queryset = Embeddings.objects.filter(
            Q(upload_file__uploaded_by=user) | Q(upload_file__uploaded_by__is_superuser=True)
        )
    else:
        # Unauthenticated users only see superuser-uploaded files
        queryset = Embeddings.objects.filter(upload_file__uploaded_by__is_superuser=True)

    queryset = (
        queryset
        .annotate(distance=L2Distance("embedding_sentence_transformers", embedding_vector))
        .order_by("distance")
    )

    # Filtering to a document GUID takes precedence over a document name
    if guid:
        queryset = queryset.filter(upload_file__guid=guid)
    elif document_name:
        queryset = queryset.filter(name=document_name)

    # Slicing is equivalent to SQL's LIMIT clause
    return queryset[:num_results]


def evaluate_query(queryset):
    """
    Evaluate a QuerySet and return a list of result dicts.

    Parameters
    ----------
    queryset : iterable
        Iterable of Embeddings objects (or any objects with the expected attributes)

    Returns
    -------
    list[dict]
        List of dicts with keys: name, text, page_number, chunk_number, distance, file_id
    """
    # Iterating evaluates the QuerySet and hits the database
    # TODO: Research improving the query evaluation performance
    return [
        {
            "name": obj.name,
            "text": obj.text,
            "page_number": obj.page_num,
            "chunk_number": obj.chunk_number,
            "distance": obj.distance,
            "file_id": obj.upload_file.guid if obj.upload_file else None,
        }
        for obj in queryset
    ]


def log_usage(
    results, message_data, user, guid, document_name, num_results, encoding_time, db_query_time
):
    """
    Create a SemanticSearchUsage record. Swallows exceptions so search isn't interrupted.

    Parameters
    ----------
    results : list[dict]
        The search results, each containing a "distance" key
    message_data : str
        The original search query text
    user : User
        The user who performed the search
    guid : str or None
        Document GUID filter used in the search
    document_name : str or None
        Document name filter used in the search
    num_results : int
        Number of results requested
    encoding_time : float
        Time in seconds to encode the query
    db_query_time : float
        Time in seconds for the database query
    """
    try:
        if results:
            distances = [r["distance"] for r in results]
            SemanticSearchUsage.objects.create(
                query_text=message_data,
                user=user if (user and user.is_authenticated) else None,
                document_guid=guid,
                document_name=document_name,
                num_results_requested=num_results,
                encoding_time=encoding_time,
                db_query_time=db_query_time,
                num_results_returned=len(results),
                max_distance=max(distances),
                median_distance=median(distances),
                min_distance=min(distances),
            )
        else:
            logger.warning("Semantic search returned no results")
            SemanticSearchUsage.objects.create(
                query_text=message_data,
                user=user if (user and user.is_authenticated) else None,
                document_guid=guid,
                document_name=document_name,
                num_results_requested=num_results,
                encoding_time=encoding_time,
                db_query_time=db_query_time,
                num_results_returned=0,
                max_distance=None,
                median_distance=None,
                min_distance=None,
            )
    except Exception as e:
        logger.error(f"Failed to create semantic search usage database record: {e}")


def get_closest_embeddings(
    user, message_data, document_name=None, guid=None, num_results=10
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

    Returns
    -------
    list[dict]
        List of dictionaries containing embedding results with keys:
        - name: document name
        - text: embedded text content
        - page_number: page number in source document
        - chunk_number: chunk number within the document
        - distance: L2 distance from query embedding
        - file_id: GUID of the source file

    Notes
    -----
    Creates a SemanticSearchUsage record. Swallows exceptions so search isn't interrupted.
    """
    encoding_start = time.time()
    model = TransformerModel.get_instance().model
    embedding_vector = model.encode(message_data)
    encoding_time = time.time() - encoding_start

    db_query_start = time.time()
    queryset = build_query(user, embedding_vector, document_name, guid, num_results)
    results = evaluate_query(queryset)
    db_query_time = time.time() - db_query_start

    log_usage(
        results, message_data, user, guid, document_name, num_results, encoding_time, db_query_time
    )

    return results
