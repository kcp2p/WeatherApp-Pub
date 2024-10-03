"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

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

interface SearchHistory {
  id: number;
  city_name: string;
  latitude: number;
  longitude: number;
  search_time: string;
}

const Dashboard: React.FC = () => {
  const router = useRouter();
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token'); // Remove the token from localStorage
    alert('You have been logged out.');
    router.push('/login'); // Redirect to login page
  };

  // Fetch search history
  useEffect(() => {
    const fetchSearchHistory = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        return;
      }

      try {
        const response = await axios.get<SearchHistory[]>(`${backendUrl}/api/search-history/`, {
          headers: {
            Authorization: `Token ${token}`,
          },
        });
        setSearchHistory(response.data);
      } catch (error: any) {
        setError('Failed to fetch search history');
      }
    };

    fetchSearchHistory();
  }, [backendUrl]);

  // Fetch weather data based on the search query
  const fetchWeatherData = async (cityName: string) => {
    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');

    if (!token) {
      setError('No authentication token found. Please login again.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get<WeatherData>(`${backendUrl}/api/weather/${cityName}`, {
        headers: {
          Authorization: `Token ${token}`,
        },
      });
      setWeatherData(response.data);
    } catch (error: any) {
      setError('Failed to fetch weather data for the requested city.');
    } finally {
      setLoading(false);
    }
  };

  // Handle search
  const handleSearch = () => {
    if (searchQuery) {
      fetchWeatherData(searchQuery);
    }
  };

  return (
    <div className="container mx-auto max-w-4xl p-8 mt-10 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Weather Dashboard</h2>
        <button
          onClick={handleLogout}
          className="py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 transition duration-300"
        >
          Logout
        </button>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Enter city name..."
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          className="mt-2 w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
        >
          Search
        </button>
      </div>

      {/* Search History */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">Previous Searches</h3>
        <div className="flex flex-wrap gap-2">
          {searchHistory.map((history) => (
            <button
              key={history.id}
              onClick={() => fetchWeatherData(history.city_name)}
              className="py-1 px-3 bg-gray-200 rounded hover:bg-gray-300"
            >
              {history.city_name}
            </button>
          ))}
        </div>
      </div>

      {/* Loading and Error Messages */}
      {loading && <p className="text-center">Loading...</p>}
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Weather Data Display */}
      {weatherData && !error && (
        <div>
          <div className="current-weather mb-8">
            <h3 className="text-xl font-semibold mb-4">
              Current Weather in {weatherData.city_name}
            </h3>
            <p><strong>Latitude:</strong> {weatherData.latitude}</p>
            <p><strong>Longitude:</strong> {weatherData.longitude}</p>
            <p><strong>Temperature:</strong> {weatherData.temperature} °C</p>
            <p><strong>Humidity:</strong> {weatherData.humidity} %</p>
            <p><strong>Wind Speed:</strong> {weatherData.wind_speed} km/h</p>
            <p className="mt-4"><strong>Cached At:</strong> {new Date(weatherData.cached_at).toLocaleString()}</p>
            <p><strong>Cache Expiry Time:</strong> {new Date(weatherData.expiry_time).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
