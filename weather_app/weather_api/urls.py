# weather_api/urls.py
from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from . import views

urlpatterns = [
    path('weather/<str:city_name>', views.get_weather, name='get_weather'),
    # path('location-history/', views.get_location_history, name='get_location_history'),
    # path('api-logs/', views.get_api_logs, name='get_api_logs'),
    # Method delete for weather/cache
    path('weather/cache/', views.delete_all_cache, name='delete_all_cache'),
    path('weather/cache/<str:city_name>', views.delete_all_city_cache, name='delete_all_city_cache'),
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),
]
