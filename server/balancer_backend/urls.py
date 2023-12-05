from django.contrib import admin
from django.urls import path, include
from django.views.generic import TemplateView
import importlib

urls = ['chatgpt', 'jira', 'listDrugs', 'listMeds', 'risk', 'login']

urlpatterns = [
    path("admin/", admin.site.urls),
    path('', TemplateView.as_view(template_name='index.html')),
]

for url in urls:
    url_module = importlib.import_module(f'api.views.{url}.urls')
    urlpatterns += getattr(url_module, 'urlpatterns', [])
