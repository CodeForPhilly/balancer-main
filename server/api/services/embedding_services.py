from django.db.models import Q
from pgvector.django import L2Distance

from .sentencetTransformer_model import TransformerModel

# Adjust import path as needed
from ..models.model_embeddings import Embeddings


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

    transformerModel = TransformerModel.get_instance().model
    embedding_message = transformerModel.encode(message_data)

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

    return results
