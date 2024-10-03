"use client";

import React, { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const handleLogin = async () => {
    setError(null);

    try {
      const response = await axios.post(`${backendUrl}/token/`, {
        username: email,
        password,
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        if (rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        }
        router.push('/dashboard');
      } else {
        setError('Invalid login credentials. Please try again.');
      }
    } catch (error) {
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 flex items-center justify-center bg-gray-100">
        <div className="max-w-md w-full">
          <img src="/logo.png" alt="Logo" className="mb-4" />
          <h2 className="text-4xl font-bold text-gray-800 mb-4">Weather App</h2>
          <p className="text-lg text-gray-600 mb-6">
            Have an account? Please enter your login details to use this application!
          </p>

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

          <div className="mb-4 relative">
            <label className="block text-gray-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md"
              placeholder="Enter your password"
            />
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
            onClick={handleLogin}
            className="w-full py-2 px-4 bg-black text-white rounded-md hover:bg-gray-800 transition duration-300"
          >
            Login
          </button>

          <p className="text-center mt-4">
            Don’t have an account? <a href="/register" className="text-blue-600">Register Here.</a>
          </p>
        </div>
      </div>
      <div className="w-1/2 bg-cover bg-center" style={{ backgroundImage: 'url(/path/to/illustration.png)' }}>
        {/* Illustration Area */}
      </div>
    </div>
  );
};

export default LoginPage;
