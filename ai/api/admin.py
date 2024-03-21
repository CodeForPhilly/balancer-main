from django.contrib import admin
from .views.embeddings.models import Embeddings


@admin.register(Embeddings)
class StateMedicationAdmin(admin.ModelAdmin):
    list_display = ['name', 'text', 'embedding']
