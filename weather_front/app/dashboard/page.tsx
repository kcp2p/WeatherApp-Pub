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
      if (error.response && error.response.status === 401) {
        // Redirect to login if unauthorized
        router.push('/login');
      }
    }
  };

  // Fetch the user's search history when the component loads
  useEffect(() => {
    fetchSearchHistory();
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
      if (error.response && error.response.status === 401) {
        // Redirect to login if unauthorized
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
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
    localStorage.removeItem('token'); // Remove token from localStorage
    router.push('/login'); // Redirect to login page
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
      if (error.response && error.response.status === 401) {
        // Redirect to login if unauthorized
        router.push('/login');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold">Weather Dashboard</h1>
          <button onClick={handleLogout} className="py-2 px-4 bg-red-500 rounded-lg hover:bg-red-600 transition duration-300">
            Logout
          </button>
        </div>

        {/* Search Bar */}
        <div className="flex items-center mb-8">
          <input
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Search for your preferred city..."
            className="flex-grow px-4 py-2 text-gray-900 rounded-lg"
          />
          <button
            onClick={handleNewSearch}
            className="ml-4 py-2 px-6 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300"
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
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            {/* Current Weather Section */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold">{weatherData.city_name}</h2>
                <p className="text-lg">{new Date().toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-6xl font-bold">{weatherData.temperature}°C</p>
                <p className="text-lg">Feels like: {weatherData.temperature}°C</p>
              </div>
            </div>
            {/* Weather Details */}
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{weatherData.humidity}%</p>
                <p>Humidity</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{weatherData.wind_speed} km/h</p>
                <p>Wind Speed</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{weatherData.pressure} hPa</p>
                <p>Pressure</p>
              </div>
              <div className="bg-gray-700 p-4 rounded-lg text-center">
                <p className="text-xl font-bold">{weatherData.uv_index}</p>
                <p>UV Index</p>
              </div>
            </div>

            {/* Hourly Forecast Section */}
            <div className="mb-8">
              <h3 className="text-2xl font-semibold mb-4">Hourly Forecast:</h3>
              <div className="grid grid-cols-6 gap-4">
                {weatherData.forecast_data.time.slice(0, 6).map((time: string, index: number) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg text-center">
                    <p className="font-bold">{new Date(time).getHours()}:00</p>
                    <p>{weatherData.forecast_data.temperature_2m[index]}°C</p>
                    <p>{weatherData.forecast_data.wind_speed_10m[index]} km/h</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 5 Days Forecast Section */}
            <div>
              <h3 className="text-2xl font-semibold mb-4">5 Days Forecast:</h3>
              <div className="grid grid-cols-5 gap-4">
                {weatherData.forecast_data.time.slice(0, 5).map((time: string, index: number) => (
                  <div key={index} className="bg-gray-700 p-4 rounded-lg text-center">
                    <p className="font-bold">{new Date(time).toLocaleDateString()}</p>
                    <p>{weatherData.forecast_data.temperature_2m[index]}°C</p>
                    <p>{weatherData.forecast_data.wind_speed_10m[index]} km/h</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
