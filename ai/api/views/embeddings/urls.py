from django.urls import path
from .views import ExtractEmbeddingsAPIView
from .views import StoreEmbeddingsAPIView

urlpatterns = [
    path('api/embeddings/extract_embeddings', ExtractEmbeddingsAPIView.as_view(),
         name='extract_embeddings'),

    path('api/embeddings/store_embeddings', StoreEmbeddingsAPIView.as_view(),
         name='store_embeddings'),
]
