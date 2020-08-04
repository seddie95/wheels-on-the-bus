"""dublin_bus URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.0/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include, re_path
from django.views.i18n import JavaScriptCatalog
from pages.views import PredictionView, \
    HomeView, \
    AutocompleteView, \
    StopsOnRoute, \
    DisplayRoutesView, \
    ClosestStopsView, \
    error_404_view,\
    RTPIView


urlpatterns = [
    path('i18n/', include('django.conf.urls.i18n')),
    path('admin/', admin.site.urls),
    path('', HomeView.as_view(), name='home'),
    path('autocomplete_stop/', AutocompleteView.as_view(), name='autocomplete_stop'),
    path('routes/', DisplayRoutesView.as_view(), name='routes'),
    path('stops/', StopsOnRoute.as_view(), name='stops'),
    path('predict/', PredictionView.as_view(), name='predict'),
    path('closest/', ClosestStopsView.as_view(), name='closest'),
    path('rtpi/', RTPIView.as_view(), name='rtpi'),
    path('404/', error_404_view, name='404'),
]
urlpatterns += [
    re_path(r'^jsi18n/$',
            JavaScriptCatalog.as_view(packages=['pages.jscripti18n']),
            name='javascript-catalog'),
]

handler404 = 'pages.views.error_404_view'

handler500 = 'pages.views.error_500_view'
