from django.urls import path
from api.views.embeddings import views

urlpatterns = [
    path("embeddings/extract_embeddings/",
         views.extract_embeddings, name="extract_embeddings"),


]
