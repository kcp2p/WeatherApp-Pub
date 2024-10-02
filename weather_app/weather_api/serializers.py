# weather_api/serializers.py
from rest_framework import serializers
from .models import CustomUser, LocationHistory, WeatherCache, UserSavedCity, Token

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['email', 'display_name', 'password' 'preferred_temperature_unit', 'preferred_wind_speed_unit']

class LocationHistorySerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationHistory
        fields = ['id', 'city_name', 'latitude', 'longitude', 'search_time']

class WeatherCacheSerializer(serializers.ModelSerializer):
    class Meta:
        model = WeatherCache
        fields = ['city_name', 'latitude', 'longitude', 'temperature', 'humidity', 'wind_speed', 'forecast_data', 'cached_at', 'expiry_time']

class UserSavedCitySerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSavedCity
        fields = ['city_name', 'latitude', 'longitude', 'saved_at']

class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Token
        fields = ["token", "created_at", "expires_at", "user_id", "is_used"]
