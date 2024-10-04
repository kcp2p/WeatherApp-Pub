# weather_api/models.py
from django.contrib.auth.models import AbstractUser, BaseUserManager
from django.db import models
from django.utils import timezone

class CustomUserManager(BaseUserManager):
    def create_user(self, email, display_name, password, preferred_temperature_unit=0, preferred_wind_speed_unit=0, **extra_fields):
        if not email:
            raise ValueError("Users must have an email address")
        if not display_name:
            raise ValueError("Users must have a display name")
        if not password:
            raise ValueError("Users must have a password")
        user = self.model(
            email=self.normalize_email(email),
            display_name=display_name,
            preferred_temperature_unit=preferred_temperature_unit,
            preferred_wind_speed_unit=preferred_wind_speed_unit,
            **extra_fields,
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, display_name, password=None, **extra_fields):
        """
        Create and return a superuser.
        """
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)

        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')

        return self.create_user(email, display_name, password, **extra_fields)

class CustomUser(AbstractUser):
    username = None
    email = models.EmailField(unique=True)
    display_name = models.CharField(max_length=150, default="Display Name")
    created_at = models.DateTimeField(default=timezone.now)

    # Custom fields
    preferred_temperature_unit = models.IntegerField(default=0, help_text="0: Celsius, 1: Fahrenheit")
    preferred_wind_speed_unit = models.IntegerField(default=0, help_text="0: km/h, 1: knots")

    # Override the default manager
    objects = CustomUserManager()

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["display_name"]

    def __str__(self):
        return self.email

# Location history
class LocationHistory(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    city_name = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    search_time = models.DateTimeField(auto_now_add=True)

# Cached weather data
class WeatherCache(models.Model):
    city_name = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    temperature = models.FloatField()
    humidity = models.IntegerField()
    wind_speed = models.FloatField()
    forecast_data = models.JSONField()
    cached_at = models.DateTimeField(auto_now_add=True)
    expiry_time = models.DateTimeField()

# API request log
class APIRequestLog(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    city_name = models.CharField(max_length=100)
    request_url = models.TextField()
    response_status = models.IntegerField()
    response_data = models.JSONField()
    request_time = models.DateTimeField(auto_now_add=True)

# User Save City to show on dashboard
class UserSavedCity(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    city_name = models.CharField(max_length=100)
    latitude = models.FloatField()
    longitude = models.FloatField()
    saved_at = models.DateTimeField(auto_now_add=True)
