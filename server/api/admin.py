from django.contrib import admin
from .views.uploadFile.models import UploadFile
from .views.listMeds.models import StateMedication


@admin.register(StateMedication)
class StateMedicationAdmin(admin.ModelAdmin):
    list_display = ['state', 'first', 'second', 'third']


@admin.register(UploadFile)
class UploadFile(admin.ModelAdmin):
    list_display = ['guid', 'file_name', 'file']
