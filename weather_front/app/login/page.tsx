"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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

  const handleLogin = async () => {
    setError(null);
    if (!email || !password) {
      setError("Please fill in both email and password");
      return;
    }

    try {
      const response = await axios.post(`${backendUrl}/token/`, {
        username: email,
        password,
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        router.push('/dashboard'); // Redirect to dashboard
      }
    } catch (error) {
      setError('Invalid login credentials. Please try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-bold mb-6 text-center">Login</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
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
        <button
          onClick={handleLogin}
          className="w-full py-2 px-4 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300"
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default LoginPage;
