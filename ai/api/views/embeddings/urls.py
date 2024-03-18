from django.urls import path
from .views import ExtractEmbeddingsAPIView

urlpatterns = [
    path('api/extractEmbeddings/', ExtractEmbeddingsAPIView.as_view(),
         name='extract-embeddings'),
]
