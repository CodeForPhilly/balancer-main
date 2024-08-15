# services/embedding_services.py
from .sentencetTransformer_model import TransformerModel
# Adjust import path as needed
from ..models.model_embeddings import Embeddings
from pgvector.django import L2Distance


def get_closest_embeddings(user, message_data, document_name=None, guid=None, num_results=10):
    #
    transformerModel = TransformerModel.get_instance().model
    embedding_message = transformerModel.encode(message_data)
    # Start building the query based on the message's embedding
    closest_embeddings_query = Embeddings.objects.filter(
        upload_file__uploaded_by=user
    ).annotate(
        distance=L2Distance(
            'embedding_sentence_transformers', embedding_message)
    ).order_by('distance')

    # Filter by GUID if provided, otherwise filter by document name if provided
    if guid:
        closest_embeddings_query = closest_embeddings_query.filter(
            upload_file__guid=guid)
    elif document_name:
        closest_embeddings_query = closest_embeddings_query.filter(
            name=document_name)

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
