from django.urls import path
from .views import ExtractEmbeddingsAPIView

urlpatterns = [
    path('extract_embeddings/', ExtractEmbeddingsAPIView.as_view(),
         name='extract-embeddings'),
]
