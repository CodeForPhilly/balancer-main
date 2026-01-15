import time
import logging
from statistics import median

from django.db.models import Q
from pgvector.django import L2Distance

from .sentencetTransformer_model import TransformerModel
from ..models.model_embeddings import Embeddings
from ..models.model_search_usage import SemanticSearchUsage

logger = logging.getLogger(__name__)

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
    """

    encoding_start = time.time()
    transformerModel = TransformerModel.get_instance().model
    embedding_message = transformerModel.encode(message_data)
    encoding_time = time.time() - encoding_start

    db_query_start = time.time()

    # Django QuerySets are lazily evaluated
    if user.is_authenticated:
        # User sees their own files + files uploaded by superusers
        closest_embeddings_query = (
            Embeddings.objects.filter(
                Q(upload_file__uploaded_by=user) | Q(upload_file__uploaded_by__is_superuser=True)
            )
            .annotate(
                distance=L2Distance("embedding_sentence_transformers", embedding_message)
            )
            .order_by("distance")
        )
    else:
        # Unauthenticated users only see superuser-uploaded files
        closest_embeddings_query = (
            Embeddings.objects.filter(upload_file__uploaded_by__is_superuser=True)
            .annotate(
                distance=L2Distance("embedding_sentence_transformers", embedding_message)
            )
            .order_by("distance")
        )

    # Filtering to a document GUID takes precedence over a document name
    if guid:
        closest_embeddings_query = closest_embeddings_query.filter(
            upload_file__guid=guid
        )
    elif document_name:
        closest_embeddings_query = closest_embeddings_query.filter(name=document_name)

    # Slicing is equivalent to SQL's LIMIT clause
    closest_embeddings_query = closest_embeddings_query[:num_results]

    # Iterating evaluates the QuerySet and hits the database
    # TODO: Research improving the query evaluation performance
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

    try:
        # Handle user having no uploaded docs or doc filtering returning no matches
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
                min_distance=min(distances)
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
                min_distance=None
            )
    except Exception as e:
        logger.error(f"Failed to create semantic search usage database record: {e}")

    return results
