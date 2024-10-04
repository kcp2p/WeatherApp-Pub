"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const RegistrationPage: React.FC = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredTemperatureUnit, setPreferredTemperatureUnit] = useState(0);
  const [preferredWindSpeedUnit, setPreferredWindSpeedUnit] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Check if user is already logged in
  useEffect(() => {
    const checkTokenValidity = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const response = await axios.get(`${backendUrl}/user/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (response.status === 200) {
          router.push('/dashboard'); // Redirect to dashboard if token is valid
        }
      } catch (error) {
        console.error("Token is invalid or expired", error);
        localStorage.removeItem('token'); // Remove invalid token
      }
    };

    checkTokenValidity();
  }, [backendUrl, router]);

  const handleRegistration = async () => {
    setError(null);

    if (!displayName || !email || !password || !confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/register/`, {
        display_name: displayName,
        email,
        password,
        preferred_temperature_unit: preferredTemperatureUnit,
        preferred_wind_speed_unit: preferredWindSpeedUnit,
      });
      if (response.data.success) {
        router.push('/login'); // Redirect to login page after successful registration
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Failed to register. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Register</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <input
          type="text"
          placeholder="Display Name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg text-gray-900"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg text-gray-900"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg text-gray-900"
        />
        <input
          type="password"
          placeholder="Password (again)"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full mb-4 px-4 py-2 rounded-lg text-gray-900"
        />
        <div className="flex gap-4 mb-4">
          <div>
            <label className="block mb-2">Preferred Temperature Unit</label>
            <select
              value={preferredTemperatureUnit}
              onChange={(e) => setPreferredTemperatureUnit(parseInt(e.target.value))}
              className="w-full px-4 py-2 text-gray-900 rounded-lg"
            >
              <option value={0}>Celsius</option>
              <option value={1}>Fahrenheit</option>
            </select>
          </div>
          <div>
            <label className="block mb-2">Preferred Wind Speed Unit</label>
            <select
              value={preferredWindSpeedUnit}
              onChange={(e) => setPreferredWindSpeedUnit(parseInt(e.target.value))}
              className="w-full px-4 py-2 text-gray-900 rounded-lg"
            >
              <option value={0}>km/h</option>
              <option value={1}>knots</option>
            </select>
          </div>
        </div>
        <button
          onClick={handleRegistration}
          className="w-full py-2 px-4 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default RegistrationPage;
