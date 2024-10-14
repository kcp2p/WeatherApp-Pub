# weather_api/urls.py
from django.urls import path
from drf_spectacular.views import SpectacularAPIView, SpectacularRedocView, SpectacularSwaggerView
from . import views
from rest_framework.authtoken import views as auth_views

urlpatterns = [
    # Automatic Documentation
    path('schema/', SpectacularAPIView.as_view(), name='schema'),
    path('schema/swagger-ui/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    path('schema/redoc/', SpectacularRedocView.as_view(url_name='schema'), name='redoc'),

    # User Routes
    path('role/', views.roles, name='roles'),
    path("register/", views.registration, name="register"),
    path('token/', auth_views.obtain_auth_token, name='token'),
    path('weather/<str:city_name>', views.get_weather, name='get_weather'),
    path('search-history/', views.get_user_search_history, name='user-search-history'),
    path('search-history/<int:id>', views.delete_search_history, name='delete-search-history'),
    path('gdpr/', views.delete_user_account, name='gdpr-deletion'),
    path('user/', views.user_info, name='user_info'),

    # Admin Routes
    path('admin/users/', views.list_all_users, name='list_all_users'),
    path('admin/cache/', views.delete_all_cache, name='delete_all_cache'),
    path('admin/cache/<str:city_name>', views.delete_all_city_cache, name='delete_all_city_cache'),
    path('admin/api-logs/', views.get_api_logs, name='get_api_logs'),
]
