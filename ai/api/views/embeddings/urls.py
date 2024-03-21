from django.urls import path
from .store_views import StoreEmbeddingsAPIView
from .search_views import SearchEmbeddingsAPIView
from .ask_views import AskEmbeddingsAPIView
from .extract_views import ExtractEmbeddingsAPIView

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
