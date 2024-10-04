# weather_api/views.py
import requests
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from .models import CustomUser, LocationHistory, WeatherCache, APIRequestLog
from .serializers import CustomUserSerializer, WeatherCacheSerializer, LocationHistorySerializer
from django.conf import settings
from django.core.mail import send_mail
import uuid
import hashlib
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password
import json


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def registration(request, format=None):
    try:
        email = request.data["email"]
        password = request.data["password"]
        display_name = request.data["display_name"]
        preferred_temperature_unit = request.data["preferred_temperature_unit"]
        preferred_wind_speed_unit = request.data["preferred_wind_speed_unit"]
    except KeyError:
        return Response(
            {"success": False, "message": "Missing required fields."},
            status=status.HTTP_200_OK,
        )
    
    if len(password) < 8:
        return Response(
            {"success": False, "message": "Password must be at least 8 characters long."},
            status=status.HTTP_200_OK,
        )
    
    if preferred_temperature_unit not in [0, 1]:
        return Response(
            {"success": False, "message": "Invalid preferred temperature unit."},
            status=status.HTTP_200_OK,
        )
    
    if preferred_wind_speed_unit not in [0, 1]:
        return Response(
            {"success": False, "message": "Invalid preferred wind speed unit."},
            status=status.HTTP_200_OK,
        )
    
    # Check if email already exists
    if CustomUser.objects.filter(email=email).exists():
        return Response(
            {"success": False, "message": "Email already exists."},
            status=status.HTTP_200_OK,
        )
    
    user = CustomUser.objects.create_user(email=email, password=password, display_name=display_name, preferred_temperature_unit=preferred_temperature_unit, preferred_wind_speed_unit=preferred_wind_speed_unit)
    if user:
        return Response(
            {"success": True, "message": "You are now registered on our website!"},
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {"success": False, "message": "Registration failed."},
            status=status.HTTP_200_OK,
        )

@api_view(['GET'])
def get_weather(request, city_name):
    # Authenticate user (temporarily hardcoded, replace with actual authentication)
    user = request.user

    # Remove all expired cache entries
    WeatherCache.objects.filter(expiry_time__lt=timezone.now()).delete()

    # Check if valid (non-expired) weather data is cached for this city
    cache = WeatherCache.objects.filter(city_name=city_name, expiry_time__gt=timezone.now()).first()
    
    if cache:
        # If cache is valid, return cached data
        weather_response = WeatherCacheSerializer(cache).data

        # Check if location history exists for the user and city
        location_history = LocationHistory.objects.filter(user=user, city_name=city_name).first()

        if location_history:
            # Delete the old location history
            location_history.delete()

        # Create a new location history
        LocationHistory.objects.create(user=user, city_name=city_name, latitude=weather_response['latitude'], longitude=weather_response['longitude'])

        # Log the API request details
        APIRequestLog.objects.create(
            user=user,
            city_name=city_name,
            request_url="Cache hit",
            response_status=200,  # Assuming success as the response code
            response_data=weather_response,
        )
        return Response(weather_response)

    # Cache is either expired or doesn't exist, so we fetch new data
    # Fetch geo-coordinates for the given city
    geo_url = f"http://api.openweathermap.org/geo/1.0/direct?q={city_name}&appid={settings.OPENWEATHER_API_KEY}".replace(' ', '%20')
    geo_response = requests.get(geo_url).json()

    if not geo_response or city_name == '' or len(city_name) > 99:
        return Response({'error': 'City not found'}, status=status.HTTP_404_NOT_FOUND)

    # Use the last result's latitude and longitude
    lat, lon = geo_response[-1]['lat'], geo_response[-1]['lon']

    # Fetch weather data using the latitude and longitude
    weather_url = (
        "https://api.open-meteo.com/v1/forecast?"
        f"latitude={lat}&"
        f"longitude={lon}&"
        "current=temperature_2m,relative_humidity_2m,wind_speed_10m,dew_point_2m,precipitation_probability,surface_pressure,wind_speed_10m,wind_direction_10m&"
        "hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,dew_point_2m,precipitation_probability,surface_pressure,wind_speed_10m,wind_direction_10m"
    )
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

    # Check if location history exists for the user and city
    location_history = LocationHistory.objects.filter(user=user, city_name=city_name).first()

    if location_history:
        # Delete the old location history
        location_history.delete()

    # Create a new location history
    LocationHistory.objects.create(user=user, city_name=city_name, latitude=lat, longitude=lon)
    
    # Log the API request details
    APIRequestLog.objects.create(
        user=user,
        city_name=city_name,
        request_url=weather_url,
        response_status=200,  # Assuming success as the response code
        response_data=weather_response,
    )

    # Return from cached
    cache = WeatherCache.objects.filter(city_name=city_name, expiry_time__gt=timezone.now()).first()
    weather_response = WeatherCacheSerializer(cache).data

    # Return the fetched weather data
    return Response(weather_response)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_all_cache(request):
    WeatherCache.objects.all().delete()

    return Response({'message': 'Cache cleared'})

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_all_city_cache(request, city_name):
    WeatherCache.objects.filter(city_name=city_name).delete()

    return Response({'message': f'Cache for {city_name} cleared'})

# View to get the location history of the user
@api_view(['GET'])
def get_location_history(request):
    user = request.user
    location_history = LocationHistory.objects.filter(user=user).order_by('-search_time')
    return Response([{'city_name': loc.city_name, 'search_time': loc.search_time} for loc in location_history])

# View to get the API logs
@api_view(['GET'])
@permission_classes([IsAdminUser])
def get_api_logs(request):
    api_logs = APIRequestLog.objects.all().order_by('-request_time')
    return Response([{
        'id': log.id,
        'user': log.user.email if log.user else "Anonymous",
        'city_name': log.city_name,
        'request_time': log.request_time,
        'request_url': log.request_url,
        'response_status': log.response_status,
        'response_data': log.response_data,
    } for log in api_logs])

@api_view(['GET'])
def get_user_search_history(request):
    user = request.user
    # Get the search history for the authenticated user, ordered by the most recent searches first
    search_history = LocationHistory.objects.filter(user=user).order_by('-search_time')
    serializer = LocationHistorySerializer(search_history, many=True)
    return Response(serializer.data)

@api_view(['DELETE'])
def delete_user_account(request):
    user = request.user
    try:
        user.delete()
        return Response({"success": True, "message": "User account deleted successfully."}, status=status.HTTP_200_OK)
    except Exception as e:
        return Response({"success": False, "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
def delete_search_history(request, id):
    user = request.user
    try:
        # Filter by authenticated user and specific search history ID
        history_entry = LocationHistory.objects.get(id=id, user=user)
        history_entry.delete()
        return Response({"success": True, "message": "Search history entry deleted successfully."}, status=status.HTTP_200_OK)
    except LocationHistory.DoesNotExist:
        return Response({"success": False, "message": "Search history entry not found."}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        return Response({"success": False, "message": str(e)}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET', 'PATCH', 'PUT'])
def user_info(request):
    user = request.user

    # Handle GET request to retrieve user information
    if request.method == 'GET':
        serializer = CustomUserSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)

    # Handle PATCH request to update user information
    elif request.method in ['PATCH', 'PUT']:
        try:
            data = json.loads(request.body)
        except json.JSONDecodeError:
            return Response({"error": "Invalid data"}, status=status.HTTP_400_BAD_REQUEST)

        # Update user object directly
        if 'display_name' in data:
            user.display_name = data['display_name']

        if 'preferred_temperature_unit' in data:
            if data['preferred_temperature_unit'] in [0, 1]:
                user.preferred_temperature_unit = data['preferred_temperature_unit']
            else:
                return Response({"error": "Invalid value for preferred_temperature_unit"}, status=status.HTTP_400_BAD_REQUEST)

        if 'preferred_wind_speed_unit' in data:
            if data['preferred_wind_speed_unit'] in [0, 1]:
                user.preferred_wind_speed_unit = data['preferred_wind_speed_unit']
            else:
                return Response({"error": "Invalid value for preferred_wind_speed_unit"}, status=status.HTTP_400_BAD_REQUEST)
            
        if 'password' in data:
            if len(data['password']) >= 8:
                user.set_password(data['password'])
            else:
                return Response({"error": "Password must be at least 8 characters long."}, status=status.HTTP_400_BAD_REQUEST)

        user.save()

        updated_serializer = CustomUserSerializer(user)
        return Response(updated_serializer.data, status=status.HTTP_200_OK)

# Admin View to GET list of all users
@api_view(['GET'])
@permission_classes([IsAdminUser])
def list_all_users(request):
    # Get all users
    users = CustomUser.objects.all()
    
    # Serialize the user data
    serializer = CustomUserSerializer(users, many=True)
    
    return Response(serializer.data, status=status.HTTP_200_OK)

@api_view(['GET'])
def roles(request):
    if request.user.is_staff or request.user.is_superuser:
        return Response({"role": "admin"}, status=status.HTTP_200_OK)
    else:
        return Response({"role": "user"}, status=status.HTTP_200_OK)
