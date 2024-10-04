"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const ProfilePage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [preferredTemperatureUnit, setPreferredTemperatureUnit] = useState<number | null>(null);
  const [preferredWindSpeedUnit, setPreferredWindSpeedUnit] = useState<number | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Fetch user info when the component loads
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    axios
      .get(`${backendUrl}/user/`, {
        headers: { Authorization: `Token ${token}` },
      })
      .then((response) => {
        const { display_name, preferred_temperature_unit, preferred_wind_speed_unit } = response.data;
        setDisplayName(display_name);
        setPreferredTemperatureUnit(preferred_temperature_unit);
        setPreferredWindSpeedUnit(preferred_wind_speed_unit);
      })
      .catch((error) => {
        console.error("Failed to fetch user info", error);
        if (error.response && error.response.data.detail === "Invalid token.") {
          router.push('/login');
        }
      });
  }, [backendUrl, router]);

  // Handle profile update submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage("Please log in again");
      return;
    }

    try {
      const response = await axios.patch(
        `${backendUrl}/user/`,
        {
          display_name: displayName,
          password: password || undefined,
          preferred_temperature_unit: preferredTemperatureUnit,
          preferred_wind_speed_unit: preferredWindSpeedUnit,
        },
        {
          headers: { Authorization: `Token ${token}` },
        }
      );

      setMessage("Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile", error);
      if (error.response && error.response.data.error) {
        setMessage(error.response.data.error);
      } else {
        setMessage("Failed to update profile. Please try again.");
      }
    }
  };

  // Handle account deletion
  const handleAccountDeletion = async () => {
    const confirmDelete = window.confirm("Are you sure you want to delete your account? This action cannot be undone.");
    if (!confirmDelete) return;

    const token = localStorage.getItem('token');
    if (!token) {
      setMessage("Please log in again");
      return;
    }

    try {
      await axios.delete(`${backendUrl}/gdpr/`, {
        headers: { Authorization: `Token ${token}` },
      });
      // Log out and redirect to login page
      localStorage.removeItem('token');
      router.push('/login');
    } catch (error) {
      console.error("Failed to delete account", error);
      setMessage("Failed to delete account. Please try again.");
    }
  };

  // Handle navigation back to Dashboard
  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl md:text-4xl font-bold">Edit Profile</h1>
          <button
            onClick={handleGoToDashboard}
            className="py-2 px-4 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Back to Dashboard
          </button>
        </div>

        {/* Profile Edit Form */}
        <form onSubmit={handleSubmit} className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="mb-6">
            <label htmlFor="displayName" className="block text-lg font-semibold mb-2">
              Display Name
            </label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 rounded-lg"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="preferredTemperatureUnit" className="block text-lg font-semibold mb-2">
              Preferred Temperature Unit
            </label>
            <select
              id="preferredTemperatureUnit"
              value={preferredTemperatureUnit ?? 0}
              onChange={(e) => setPreferredTemperatureUnit(parseInt(e.target.value))}
              className="w-full px-4 py-2 text-gray-900 rounded-lg"
              required
            >
              <option value={0}>Celsius</option>
              <option value={1}>Fahrenheit</option>
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="preferredWindSpeedUnit" className="block text-lg font-semibold mb-2">
              Preferred Wind Speed Unit
            </label>
            <select
              id="preferredWindSpeedUnit"
              value={preferredWindSpeedUnit ?? 0}
              onChange={(e) => setPreferredWindSpeedUnit(parseInt(e.target.value))}
              className="w-full px-4 py-2 text-gray-900 rounded-lg"
              required
            >
              <option value={0}>km/h</option>
              <option value={1}>knots</option>
            </select>
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-lg font-semibold mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 rounded-lg"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="confirmPassword" className="block text-lg font-semibold mb-2">
              Password (again)
            </label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 text-gray-900 rounded-lg"
            />
          </div>

          {message && (
            <div
              className={`p-2 rounded mb-4 ${
                message.includes('successfully') ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'
              }`}
            >
              {message}
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <button
              type="submit"
              className="py-2 px-4 bg-green-500 rounded-lg hover:bg-green-600 transition duration-300 w-full sm:w-auto"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={handleAccountDeletion}
              className="py-2 px-4 bg-red-500 rounded-lg hover:bg-red-600 transition duration-300 w-full sm:w-auto"
            >
              Delete Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfilePage;
