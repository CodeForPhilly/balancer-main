from django.contrib import admin
from .views.uploadFile.models import UploadFile
from .views.listMeds.models import StateMedication
from .models.authUser import UserAccount


@admin.register(StateMedication)
class StateMedicationAdmin(admin.ModelAdmin):
    list_display = ['state', 'first', 'second', 'third']


@admin.register(UploadFile)
class UploadFile(admin.ModelAdmin):
    list_display = ['guid', 'file_name', 'file']


@admin.register(UserAccount)
class UserAccountAdmin(admin.ModelAdmin):
    list_display = ['id', 'first_name', 'email', 'is_superuser']
