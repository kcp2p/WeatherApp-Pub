# weather_api/views.py
import requests
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import CustomUser, LocationHistory, WeatherCache, APIRequestLog
from .serializers import WeatherCacheSerializer
from weather_app.settings import OPENWEATHER_API_KEY

@api_view(['GET'])
def get_weather(request, city_name):
    # Authenticate user (temporarily hardcoded, replace with actual authentication)
    user = CustomUser.objects.get(email="krittin@42bangkok.com")

    # Remove all expired cache entries
    WeatherCache.objects.filter(expiry_time__lt=timezone.now()).delete()

    # Check if valid (non-expired) weather data is cached for this city
    cache = WeatherCache.objects.filter(city_name=city_name, expiry_time__gt=timezone.now()).first()
    
    if cache:
        # If cache is valid, return cached data
        return Response(WeatherCacheSerializer(cache).data)

    # Cache is either expired or doesn't exist, so we fetch new data
    # Fetch geo-coordinates for the given city
    geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city_name}&appid={OPENWEATHER_API_KEY}".replace(' ', '%20')
    geo_response = requests.get(geo_url).json()

    if not geo_response or city_name == '' or len(city_name) > 99:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)

    # Use the last result's latitude and longitude
    lat, lon = geo_response[-1]['lat'], geo_response[-1]['lon']

    # Fetch weather data using the latitude and longitude
    weather_url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m"
    weather_response = requests.get(weather_url).json()

    if 'current' not in weather_response:
        return Response({'error': 'Weather data not available'}, status=status.HTTP_404_NOT_FOUND)

    # Save new weather data to cache with an expiry time of 1 hour
    WeatherCache.objects.create(
        city_name=city_name,
        latitude=lat,
        longitude=lon,
        temperature=weather_response['current']['temperature_2m'],
        humidity=weather_response['current']['relative_humidity_2m'],
        wind_speed=weather_response['current']['wind_speed_10m'],
        forecast_data=weather_response['hourly'],
        expiry_time=timezone.now() + timezone.timedelta(hours=1),
    )

    # Log the search history for the user
    LocationHistory.objects.create(user=user, city_name=city_name, latitude=lat, longitude=lon)

    # Log the API request details
    APIRequestLog.objects.create(
        user=user,
        city_name=city_name,
        request_url=weather_url,
        response_status=200,  # Assuming success as the response code
        response_data=weather_response,
    )

    # Return the fetched weather data
    return Response(weather_response)

@api_view(['DELETE'])
def delete_all_cache(request):
    WeatherCache.objects.all().delete()

    return Response({'message': 'Cache cleared'})

@api_view(['DELETE'])
def delete_all_city_cache(request, city_name):
    WeatherCache.objects.filter(city_name=city_name).delete()

    return Response({'message': f'Cache for {city_name} cleared'})
