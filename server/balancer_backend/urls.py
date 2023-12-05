from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
from django.conf import settings
from django.contrib.staticfiles.urls import staticfiles_urlpatterns
from django.shortcuts import render
import importlib

urls = ['chatgpt', 'jira', 'listDrugs', 'listMeds', 'risk', 'login']

def serve_static_index(request):
    return render(request, 'index.html')

urlpatterns = [
    path('', serve_static_index),
    path("admin/", admin.site.urls),
] + staticfiles_urlpatterns()

for url in urls:
    url_module = importlib.import_module(f'api.views.{url}.urls')
    urlpatterns += getattr(url_module, 'urlpatterns', [])