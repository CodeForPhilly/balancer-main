from django.contrib import admin
from django.urls import path, include
import importlib

urls = ['chatgpt', 'jira', 'listDrugs', 'listMeds', 'risk']

urlpatterns = [
    path("admin/", admin.site.urls),
    path('accounts/', include('allauth.urls')),
]

for url in urls:
    url_module = importlib.import_module(f'api.views.{url}.urls')
    urlpatterns += getattr(url_module, 'urlpatterns', [])
