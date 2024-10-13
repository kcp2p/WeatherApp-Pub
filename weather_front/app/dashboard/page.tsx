"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface SearchHistoryItem {
  id: number;
  city_name: string;
}

const DashboardPage: React.FC = () => {
  const [city, setCity] = useState('');
  const [weatherData, setWeatherData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [userPreferences, setUserPreferences] = useState<any | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Check if user is authenticated and redirect if token is missing or invalid
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
    }
  }, [router]);

  // Fetch the user's previous search history
  const fetchSearchHistory = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get(`${backendUrl}/search-history/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setSearchHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch search history", error);
      if ((error as any).response && (error as any).response.status === 401) {
        // Redirect to login if unauthorized
        router.push('/login');
      }
    }
  };

  // Fetch the user's preferences and role
  const fetchUserPreferences = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await axios.get(`${backendUrl}/user/`, {
        headers: { Authorization: `Token ${token}` },
      });
      setUserPreferences(response.data);

      // Check if the user is an admin
      const roleResponse = await axios.get(`${backendUrl}/role/`, {
        headers: { Authorization: `Token ${token}` },
      });
      if (roleResponse.data.role === 'admin') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error("Failed to fetch user preferences", error);
      if ((error as any).response && (error as any).response.status === 401) {
        router.push('/login');
      }
    }
  };

  // Fetch the user's search history and preferences when the component loads
  useEffect(() => {
    fetchSearchHistory();
    fetchUserPreferences();
  }, [backendUrl, router]);

  // Fetch weather data based on the user's search
  const handleSearch = async (searchedCity: string) => {
    if (!searchedCity) {
      setError('Please enter a city name');
      return;
    }

    setLoading(true);
    setError(null);

    const token = localStorage.getItem('token');
    if (!token) {
      setError("Please log in again");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`${backendUrl}/weather/${searchedCity}`, {
        headers: { Authorization: `Token ${token}` },
      });
      setWeatherData(response.data);
      // Fetch updated search history from backend
      await fetchSearchHistory();
    } catch (error) {
      setError('Unable to fetch weather data. Please try again.');
      if ((error as any).response && (error as any).response.status === 401) {
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get wind direction as a compass point
  const getWindDirection = (degree: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(degree / 45) % 8;
    return directions[index];
  };

  // Handle search for a new city
  const handleNewSearch = () => {
    handleSearch(city);
  };

  // Handle click on previous search
  const handlePreviousSearch = (selectedCity: string) => {
    setCity(selectedCity);
    handleSearch(selectedCity);
  };

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  // Handle navigation to Profile page
  const handleGoToProfile = () => {
    router.push('/profile');
  };

  // Handle navigation to Admin page
  const handleGoToAdmin = () => {
    router.push('/admin');
  };

  // Convert temperature based on preference
  const convertTemperature = (temperature: number) => {
    if (userPreferences?.preferred_temperature_unit === 1) {
      // Convert Celsius to Fahrenheit
      return ((temperature * 9) / 5 + 32).toFixed(2);
    }
    return temperature.toFixed(2); // Celsius by default
  };

  // Convert wind speed based on preference
  const convertWindSpeed = (windSpeed: number) => {
    if (userPreferences?.preferred_wind_speed_unit === 1) {
      // Convert km/h to knots
      return (windSpeed * 0.539957).toFixed(2);
    }
    return windSpeed.toFixed(2); // km/h by default
  };

  // Handle deleting a specific search history item
  const handleDeleteSearchHistory = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this search history item?");
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setError("Please log in again");
      return;
    }

    try {
      await axios.delete(`${backendUrl}/search-history/${id}`, {
        headers: { Authorization: `Token ${token}` },
      });
      // Fetch updated search history after deletion
      await fetchSearchHistory();
    } catch (error) {
      console.error("Failed to delete search history", error);
      if ((error as any).response && (error as any).response.status === 401) {
        // Redirect to login if unauthorized
        router.push('/login');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold text-center sm:text-left">Weather Dashboard</h1>
          <div className="flex gap-4">
            <button
              onClick={handleGoToProfile}
              className="py-2 px-4 bg-green-500 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Profile
            </button>
            {isAdmin && (
              <button
                onClick={handleGoToAdmin}
                className="py-2 px-4 bg-yellow-500 rounded-lg hover:bg-yellow-600 transition duration-300"
              >
                Admin Page
              </button>
            )}
            <button
              onClick={handleLogout}
              className="py-2 px-4 bg-red-500 rounded-lg hover:bg-red-600 transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row items-center mb-8 gap-4">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search for your preferred city..."
            className="flex-grow px-4 py-2 text-gray-900 rounded-lg w-full sm:w-auto"
          />
          <button
            onClick={handleNewSearch}
            className="py-2 px-6 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
          >
            Search
          </button>
        </div>

        {/* Display Search History */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Previous Searches</h3>
          <div className="flex flex-wrap gap-3">
            {searchHistory.map((historyItem) => (
              <div key={historyItem.id} className="flex items-center gap-2 bg-gray-700 p-2 rounded">
                <button
                  onClick={() => handlePreviousSearch(historyItem.city_name)}
                  className="py-1 px-3 bg-gray-800 rounded hover:bg-gray-600 transition"
                >
                  {historyItem.city_name}
                </button>
                <button
                  onClick={() => handleDeleteSearchHistory(historyItem.id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  ✖
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Loading and Error Handling */}
        {loading && <p className="text-center">Loading...</p>}
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Display Weather Data */}
        {weatherData && (
          <div className="bg-gray-800 p-4 md:p-8 rounded-lg shadow-lg">
            {/* Current Weather Section */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
              <div className="text-center md:text-left">
                <h2 className="text-3xl font-bold">{weatherData.city_name}</h2>
                <p className="text-lg">{new Date().toLocaleString()}</p>
              </div>
              <div className="text-center md:text-right">
                <p className="text-5xl md:text-6xl font-bold">
                  {convertTemperature(weatherData.temperature)}°{userPreferences?.preferred_temperature_unit === 1 ? 'F' : 'C'}
                </p>
                <p className="text-lg">Humidity: {weatherData.humidity}%</p>
              </div>
            </div>

            {/* Weather Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">
                  {convertWindSpeed(weatherData.wind_speed)}{' '}
                  {userPreferences?.preferred_wind_speed_unit === 1 ? 'knots' : 'km/h'}
                </p>
                <p>Wind Speed</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">
                  {weatherData.forecast_data.wind_direction_10m[0]}° ({getWindDirection(weatherData.forecast_data.wind_direction_10m[0])})
                </p>
                <p>Wind Direction</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{weatherData.forecast_data.surface_pressure[0]} hPa</p>
                <p>Surface Pressure</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">
                  {convertTemperature(weatherData.forecast_data.dew_point_2m[0])}°{userPreferences?.preferred_temperature_unit === 1 ? 'F' : 'C'}
                </p>
                <p>Dew Point</p>
              </div>
            </div>

            {/* Hourly Forecast Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-4">Hourly Forecast:</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {weatherData.forecast_data.time.slice(0, 6).map((time: string, index: number) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg text-center">
                    <p className="font-bold">{new Date(time).getHours()}:00</p>
                    <p>
                      {convertTemperature(weatherData.forecast_data.temperature_2m[index])}°
                      {userPreferences?.preferred_temperature_unit === 1 ? 'F' : 'C'}
                    </p>
                    <p>
                      Wind: {convertWindSpeed(weatherData.forecast_data.wind_speed_10m[index])}{' '}
                      {userPreferences?.preferred_wind_speed_unit === 1 ? 'knots' : 'km/h'}
                    </p>
                    <p>Precipitation: {weatherData.forecast_data.precipitation_probability[index]}%</p>
                    <p>
                      Direction: {weatherData.forecast_data.wind_direction_10m[index]}° (
                      {getWindDirection(weatherData.forecast_data.wind_direction_10m[index])})
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 Days Forecast Section */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">5 Days Forecast:</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {Array.from(new Set(weatherData.forecast_data.time.map((time: string) => new Date(time).toDateString())))
                  .slice(0, 5)
                  .map((dateString, index) => {
                    // Get index for the first occurrence of each day
                    const dayIndex = weatherData.forecast_data.time.findIndex((time: string) => new Date(time).toDateString() === dateString);
                    return (
                      <div key={index} className="bg-gray-700 p-4 rounded-lg text-center">
                        <p className="font-bold">{dateString as React.ReactNode}</p>
                        <p>
                          {convertTemperature(weatherData.forecast_data.temperature_2m[dayIndex])}°
                          {userPreferences?.preferred_temperature_unit === 1 ? 'F' : 'C'}
                        </p>
                        <p>
                          Wind: {convertWindSpeed(weatherData.forecast_data.wind_speed_10m[dayIndex])}{' '}
                          {userPreferences?.preferred_wind_speed_unit === 1 ? 'knots' : 'km/h'}
                        </p>
                        <p>Precipitation: {weatherData.forecast_data.precipitation_probability[dayIndex]}%</p>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
