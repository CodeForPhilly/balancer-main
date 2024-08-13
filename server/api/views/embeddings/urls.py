from django.urls import path
from .embeddingsView import AskEmbeddingsAPIView


urlpatterns = [

    path('v1/api/embeddings/ask_embeddings', AskEmbeddingsAPIView.as_view(),
         name='ask_embeddings'),

]
