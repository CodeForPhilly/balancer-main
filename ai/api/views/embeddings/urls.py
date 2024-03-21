from django.urls import path
from .views import ExtractEmbeddingsAPIView
from .views import StoreEmbeddingsAPIView
from .SearchEmbeddings import SearchEmbeddingsAPIView
from .AskEmbeddings import AskEmbeddingsAPIView

urlpatterns = [
    path('api/embeddings/extract_embeddings', ExtractEmbeddingsAPIView.as_view(),
         name='extract_embeddings'),

    path('api/embeddings/store_embeddings', StoreEmbeddingsAPIView.as_view(),
         name='store_embeddings'),

    path('api/embeddings/search_embeddings', SearchEmbeddingsAPIView.as_view(),
         name='search_embeddings'),

    path('api/embeddings/ask_embeddings', AskEmbeddingsAPIView.as_view(),
         name='ask_embeddings'),
]
