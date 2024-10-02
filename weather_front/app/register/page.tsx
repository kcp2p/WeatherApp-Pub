"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface RegisterForm {
  email: string;
  password: string;
  confirm_password: string;
  display_name: string;
  preferred_temperature_unit: number; // 0 for Celsius, 1 for Fahrenheit
  preferred_wind_speed_unit: number; // 0 for km/h, 1 for knots
}

interface RegisterResponse {
  success: boolean;
  message: string;
}

const Register: React.FC = () => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterForm>();
  const router = useRouter();
  
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL; // Get the backend URL

  // Watching password and confirm_password to check if they match
  const password = watch('password');
  const confirmPassword = watch('confirm_password');

  const onSubmit = async (data: RegisterForm) => {
    if (password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }

    try {
      const response = await axios.post<RegisterResponse>(`${backendUrl}/api/register`, {
        email: data.email,
        password: data.password,
        display_name: data.display_name,
        preferred_temperature_unit: Number(data.preferred_temperature_unit), // Ensure number type
        preferred_wind_speed_unit: Number(data.preferred_wind_speed_unit), // Ensure number type
      });

      if (!response.data.success) {
        // Handle the case where success is false
        alert(response.data.message || 'Registration failed. Please try again.');
        return;
      }

      // If success is true, redirect to login page
      alert(response.data.message);
      router.push('/login'); // Redirect to login page after successful registration
    } catch (error: any) {
      alert(error.response?.data?.message || 'Registration failed due to an unexpected error');
    }
  };

  return (
    <div className="container mx-auto max-w-lg p-8 mt-10 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold text-center mb-6">Register</h2>
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
            {...register('password', { required: true, minLength: 8 })} 
            type="password" 
            placeholder="Password" 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">Password must be at least 8 characters long</p>
          )}
        </div>

        <div>
          <input 
            {...register('confirm_password', { required: true })} 
            type="password" 
            placeholder="Confirm Password" 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.confirm_password && (
            <p className="text-red-500 text-sm mt-1">Please confirm your password</p>
          )}
          {password !== confirmPassword && confirmPassword && (
            <p className="text-red-500 text-sm mt-1">Passwords do not match</p>
          )}
        </div>

        <div>
          <input 
            {...register('display_name', { required: true })} 
            placeholder="Display Name" 
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.display_name && (
            <p className="text-red-500 text-sm mt-1">Display name is required</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Preferred Temperature Unit:</label>
          <select 
            {...register('preferred_temperature_unit', { required: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>Celsius (°C)</option>
            <option value={1}>Fahrenheit (°F)</option>
          </select>
          {errors.preferred_temperature_unit && (
            <p className="text-red-500 text-sm mt-1">Please select a temperature unit</p>
          )}
        </div>

        <div>
          <label className="block text-gray-700 mb-2">Preferred Wind Speed Unit:</label>
          <select 
            {...register('preferred_wind_speed_unit', { required: true })}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={0}>km/h</option>
            <option value={1}>knots</option>
          </select>
          {errors.preferred_wind_speed_unit && (
            <p className="text-red-500 text-sm mt-1">Please select a wind speed unit</p>
          )}
        </div>

        <button 
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition duration-300"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default Register;
