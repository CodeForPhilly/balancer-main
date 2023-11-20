from django.contrib import admin
from django.urls import path, include
import importlib

urls = ['chatgpt', 'jira', 'listDrugs', 'listMeds', 'risk', 'login', 'test']

urlpatterns = [
    path("admin/", admin.site.urls),
]

for url in urls:
    url_module = importlib.import_module(f'api.views.{url}.urls')
    urlpatterns += getattr(url_module, 'urlpatterns', [])
