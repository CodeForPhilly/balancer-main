from django.contrib import admin
from user_management import urls as user_management_urls
from django.urls import path, include
import importlib

urls = ['chatgpt', 'jira', 'listDrugs', 'listMeds', 'risk']

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", include(user_management_urls)),
]

for url in urls:
    url_module = importlib.import_module(f'api.views.{url}.urls')
    urlpatterns += getattr(url_module, 'urlpatterns', [])
