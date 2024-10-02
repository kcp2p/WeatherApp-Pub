# weather_api/views.py
import requests
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from .models import CustomUser, LocationHistory, WeatherCache, APIRequestLog, Token
from .serializers import WeatherCacheSerializer, TokenSerializer, LocationHistorySerializer
from django.conf import settings
from django.core.mail import send_mail
import uuid
import hashlib
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import check_password

def mail_template(content, button_url, button_text):
    return f"""<!DOCTYPE html>
            <html>
            <body style="text-align: center; font-family: "Verdana", serif; color: #000;">
                <div style="max-width: 600px; margin: 10px; background-color: #fafafa; padding: 25px; border-radius: 20px;">
                <p style="text-align: left;">{content}</p>
                <a href="{button_url}" target="_blank">
                    <button style="background-color: #444394; border: 0; width: 200px; height: 30px; border-radius: 6px; color: #fff;">{button_text}</button>
                </a>
                <p style="text-align: left;">
                    If you are unable to click the above button, copy paste the below URL into your address bar
                </p>
                <a href="{button_url}" target="_blank">
                    <p style="margin: 0px; text-align: left; font-size: 10px; text-decoration: none;">{button_url}</p>
                </a>
                </div>
            </body>
            </html>"""


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def reset_password(request, format=None):
    user_id = request.data["id"]
    token = request.data["token"]
    password = request.data["password"]

    token_obj = Token.objects.filter(
        user_id=user_id).order_by("-created_at")[0]
    if token_obj.expires_at < timezone.now():
        return Response(
            {
                "success": False,
                "message": "Password Reset Link has expired!",
            },
            status=status.HTTP_200_OK,
        )
    elif token_obj is None or token != token_obj.token or token_obj.is_used:
        return Response(
            {
                "success": False,
                "message": "Reset Password link is invalid!",
            },
            status=status.HTTP_200_OK,
        )
    else:
        token_obj.is_used = True
        try:
            user = CustomUser.objects.get(id=user_id)
        except CustomUser.DoesNotExist:
            return Response(
            {
                "success": False,
                "message": "User does not exist!",
            },
            status=status.HTTP_200_OK,
            )
        
        user.set_password(password)
        user.save()
        token_obj.save()
        return Response(
            {
            "success": True,
            "message": "Your password reset was successful!",
            },
            status=status.HTTP_200_OK,
        )


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def forgot_password(request, format=None):
    email = request.data["email"]
    user = CustomUser.objects.get(email=email)
    created_at = timezone.now()
    expires_at = timezone.now() + timezone.timedelta(1)
    salt = uuid.uuid4().hex
    token = hashlib.sha512(
        (str(user.id) + user.password + created_at.isoformat() + salt).encode(
            "utf-8"
        )
    ).hexdigest()
    token_obj = {
        "token": token,
        "created_at": created_at,
        "expires_at": expires_at,
        "user_id": user.id,
    }
    serializer = TokenSerializer(data=token_obj)
    if serializer.is_valid():
        serializer.save()
        subject = "Forgot Password Link"
        content = mail_template(
            "We have received a request to reset your password. Please reset your password using the link below.",
            f"{settings.BACKEND_URL}/resetPassword?id={user.id}&token={token}",
            "Reset Password",
        )
        send_mail(
            subject=subject,
            message=content,
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            html_message=content,
        )
        return Response(
            {
                "success": True,
                "message": "A password reset link has been sent to your email.",
            },
            status=status.HTTP_200_OK,
        )
    else:
        error_msg = ""
        for key in serializer.errors:
            error_msg += serializer.errors[key][0]
        return Response(
            {
                "success": False,
                "message": error_msg,
            },
            status=status.HTTP_200_OK,
        )


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def registration(request, format=None):
    email = request.data["email"]
    password = request.data["password"]
    display_name = request.data["display_name"]
    preferred_temperature_unit = request.data["preferred_temperature_unit"]
    preferred_wind_speed_unit = request.data["preferred_wind_speed_unit"]
    
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


@api_view(['POST'])
@authentication_classes([])
@permission_classes([])
def login(request, format=None):
    email = request.data["email"]
    password = request.data["password"]
    user = authenticate(request, email=email, password=password)
    if user is None or not check_password(password, user.password):
        return Response(
            {
                "success": False,
                "message": "Invalid Login Credentials!",
            },
            status=status.HTTP_200_OK,
        )
    else:
        return Response(
            {"success": True, "message": "You are now logged in!"},
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
        'user': log.user.email,
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
