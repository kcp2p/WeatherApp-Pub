# weather_api/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, LocationHistory, WeatherCache, UserSavedCity

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['email', 'preferred_temperature_unit', 'preferred_wind_speed_unit']

admin.site.register(CustomUser, CustomUserAdmin)

class LocationHistoryAdmin(admin.ModelAdmin):
    model = LocationHistory
    list_display = ['user', 'city_name']

admin.site.register(LocationHistory, LocationHistoryAdmin)

class WeatherCacheAdmin(admin.ModelAdmin):
    model = WeatherCache
    list_display = ['city_name', 'temperature', 'humidity', 'wind_speed', 'cached_at', 'expiry_time']

admin.site.register(WeatherCache, WeatherCacheAdmin)

class UserSavedCityAdmin(admin.ModelAdmin):
    model = UserSavedCity
    list_display = ['user', 'city_name', 'saved_at']

admin.site.register(UserSavedCity, UserSavedCityAdmin)
