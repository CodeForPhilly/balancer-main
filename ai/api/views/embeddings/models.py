from django.db import models
from pgvector.django import VectorField


class Embeddings(models.Model):
    name = models.CharField(max_length=255)
    text = models.TextField()
    chunk_number = models.IntegerField(blank=True, null=True)
    embedding = VectorField(dimensions=384)
