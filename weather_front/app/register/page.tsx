"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [preferredTemperature, setPreferredTemperature] = useState(0);
  const [preferredWindSpeed, setPreferredWindSpeed] = useState(0);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleRegister = async () => {
    setError(null);
    try {
      const response = await axios.post(`${backendUrl}/register`, {
        email,
        password,
        preferred_temperature_unit: preferredTemperature,
        preferred_wind_speed_unit: preferredWindSpeed,
      });

      if (response.data.success) {
        alert('Registration successful! Please log in.');
        router.push('/login');
      } else {
        setError(response.data.message);
      }
    } catch (error) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full">
          <img src="/logo.png" alt="Logo" className="mb-4" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Weather App</h2>
          <p className="text-lg text-gray-600 mb-6">Please enter your information to register!</p>
          
          <div className="mb-4">
            <label className="block text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="johndoe@gmail.com"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700">Preferred Units</label>
            <div className="flex gap-4">
              <div>
                <input
                  type="radio"
                  value={0}
                  checked={preferredWindSpeed === 0}
                  onChange={() => setPreferredWindSpeed(0)}
                  className="mr-2"
                />
                km/h
              </div>
              <div>
                <input
                  type="radio"
                  value={1}
                  checked={preferredWindSpeed === 1}
                  onChange={() => setPreferredWindSpeed(1)}
                  className="mr-2"
                />
                knots
              </div>
            </div>

            <div className="flex gap-4 mt-4">
              <div>
                <input
                  type="radio"
                  value={0}
                  checked={preferredTemperature === 0}
                  onChange={() => setPreferredTemperature(0)}
                  className="mr-2"
                />
                °C
              </div>
              <div>
                <input
                  type="radio"
                  value={1}
                  checked={preferredTemperature === 1}
                  onChange={() => setPreferredTemperature(1)}
                  className="mr-2"
                />
                °F
              </div>
            </div>
          </div>

          <div className="flex items-center mb-4">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={() => setRememberMe(!rememberMe)}
              className="mr-2"
            />
            <label className="text-gray-700">Remember Me</label>
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <button
            onClick={handleRegister}
            className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition duration-300"
          >
            Register
          </button>

          <p className="text-center mt-4">
            Already have an account? <a href="/login" className="text-blue-600">Login Here.</a>
          </p>
        </div>
      </div>
      <div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: 'url(/path/to/illustration.png)' }}>
        {/* Illustration Area */}
      </div>
    </div>
  );
};

export default RegisterPage;
