from django.contrib import admin
from django.urls import path, include
import importlib

subfolders = ['auth', 'chatgpt', 'jira', 'listDrugs', 'listMeds', 'risk']

urlpatterns = [
    path("admin/", admin.site.urls),
]

for subfolder in subfolders:
    url_module = importlib.import_module(f'balancer_backend.views.{subfolder}.urls')
    urlpatterns += getattr(url_module, 'urlpatterns', [])