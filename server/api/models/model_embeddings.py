from django.db import models
from django.conf import settings
from pgvector.django import VectorField
import uuid
from ..views.uploadFile.models import UploadFile


class Embeddings(models.Model):
    upload_file = models.ForeignKey(
        UploadFile, related_name='embeddings', on_delete=models.CASCADE)
    # This is a new unique GUID for each Embedding
    guid = models.UUIDField(unique=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=255)
    text = models.TextField()
    page_num = models.IntegerField(default=1)
    chunk_number = models.IntegerField()
    embedding_sentence_transformers = VectorField(
        dimensions=384, null=True)
    date_of_upload = models.DateTimeField(auto_now_add=True, blank=True)

    def __str__(self):
        return self.name
