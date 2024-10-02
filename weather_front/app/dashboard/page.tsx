"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface ForecastData {
  time: string[];
  temperature_2m: number[];
  wind_speed_10m: number[];
  relative_humidity_2m: number[];
}

interface WeatherData {
  city_name: string;
  latitude: number;
  longitude: number;
  temperature: number;
  humidity: number;
  wind_speed: number;
  forecast_data: ForecastData;
  cached_at: string;
  expiry_time: string;
}

const Dashboard: React.FC = () => {
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchWeatherData = async () => {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');

      if (!token) {
        setError('No authentication token found. Please login again.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<WeatherData>(`${backendUrl}/api/weather/Tokyo`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });

        setWeatherData(response.data);
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to fetch weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchWeatherData();
  }, [backendUrl]);

  // Utility function to convert ISO 8601 date string to human-readable format
  const formatTime = (isoTime: string) => {
    const date = new Date(isoTime);
    return date.toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="container mx-auto max-w-4xl p-8 mt-10 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Weather Dashboard</h2>

      {loading && <p className="text-center">Loading...</p>}

      {error && (
        <p className="text-red-500 text-center">{error}</p>
      )}

      {weatherData && !error && (
        <div>
          <div className="current-weather mb-8">
            <h3 className="text-xl font-semibold mb-4">Current Weather in {weatherData.city_name}</h3>
            <p><strong>Latitude:</strong> {weatherData.latitude}</p>
            <p><strong>Longitude:</strong> {weatherData.longitude}</p>
            <p><strong>Temperature:</strong> {weatherData.temperature} °C</p>
            <p><strong>Humidity:</strong> {weatherData.humidity} %</p>
            <p><strong>Wind Speed:</strong> {weatherData.wind_speed} km/h</p>
            <p className="mt-4"><strong>Cached At:</strong> {formatTime(weatherData.cached_at)}</p>
            <p><strong>Cache Expiry Time:</strong> {formatTime(weatherData.expiry_time)}</p>
          </div>

          <div className="hourly-forecast">
            <h3 className="text-xl font-semibold mb-4">Hourly Forecast</h3>
            <table className="min-w-full bg-white border border-gray-300">
              <thead>
                <tr>
                  <th className="py-2 border-b">Time</th>
                  <th className="py-2 border-b">Temperature (°C)</th>
                  <th className="py-2 border-b">Humidity (%)</th>
                  <th className="py-2 border-b">Wind Speed (km/h)</th>
                </tr>
              </thead>
              <tbody>
                {weatherData.forecast_data.time.map((time, index) => (
                  <tr key={index}>
                    <td className="py-2 border-b text-center">{formatTime(time)}</td>
                    <td className="py-2 border-b text-center">{weatherData.forecast_data.temperature_2m[index]}</td>
                    <td className="py-2 border-b text-center">{weatherData.forecast_data.relative_humidity_2m[index]}</td>
                    <td className="py-2 border-b text-center">{weatherData.forecast_data.wind_speed_10m[index]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
