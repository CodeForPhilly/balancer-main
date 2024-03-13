from django.contrib import admin
from .views.uploadFile.models import UploadFile
from .views.listMeds.models import Medication, Diagnosis, Suggestion

@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ['name', 'benefits', 'risks']

@admin.register(Diagnosis)
class DiagnosisAdmin(admin.ModelAdmin):
    list_display = ['state']

@admin.register(Suggestion)
class SuggestionAdmin(admin.ModelAdmin):
    list_display = ['diagnosis', 'medication', 'tier']

@admin.register(UploadFile)
class UploadFile(admin.ModelAdmin):
    list_display = ['guid', 'file_name', 'file']
