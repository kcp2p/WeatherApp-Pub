"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface LoginForm {
  email: string;
  password: string;
}

interface TokenResponse {
  token: string;
}

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginForm>();
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL; // Get the backend URL

  const onSubmit = async (data: LoginForm) => {
    try {
      // Sending username instead of email in the payload as required by the API
      const response = await axios.post<TokenResponse>(`${backendUrl}/api/token/`, {
        username: data.email,
        password: data.password,
      });

      // If token is received, proceed to store it and navigate to the dashboard
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        alert('Login successful');
        router.push('/dashboard');
      } else {
        alert('Login failed. Token not received.');
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Login failed due to an unexpected error');
    }
  };

  return (
    <div className="container mx-auto max-w-lg p-8 mt-10 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <input
            {...register('email', { required: true })}
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">Email is required</p>}
        </div>

        <div>
          <input
            {...register('password', { required: true })}
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && <p className="text-red-500 text-sm mt-1">Password is required</p>}
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
