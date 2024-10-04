"use client";

import React from 'react';
import { useRouter } from 'next/navigation';

const LandingPage: React.FC = () => {
  const router = useRouter();

  const privateUrl = process.env.PRIVATE_IMAGE;

  // Handle navigation to Login page
  const handleGoToLogin = () => {
    router.push('/login');
  };

  // Handle navigation to Register page
  const handleGoToRegister = () => {
    router.push('/register');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Weather Dashboard Application</h1>
          <p className="text-lg text-gray-400">
            Your personal weather assistant, providing real-time weather updates and forecasts.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={handleGoToLogin}
              className="py-2 px-6 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300"
            >
              Login
            </button>
            <button
              onClick={handleGoToRegister}
              className="py-2 px-6 bg-green-500 rounded-lg hover:bg-green-600 transition duration-300"
            >
              Register
            </button>
          </div>
        </header>

        {/* Features Section */}
        <section className="mb-16">
          <h2 className="text-3xl font-semibold mb-6">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-xl font-bold mb-2">Real-Time Weather</h3>
              <p>Get up-to-date weather information for any city around the world.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-xl font-bold mb-2">Forecast Data</h3>
              <p>Hourly and 5-day forecasts to help you plan your day better.</p>
            </div>
            <div className="bg-gray-800 p-6 rounded-lg shadow-lg text-center">
              <h3 className="text-xl font-bold mb-2">User Preferences</h3>
              <p>Customize your weather experience with preferred units for temperature and wind speed.</p>
            </div>
          </div>
        </section>

        {/* About Creator Section */}
        <section>
          <h2 className="text-3xl font-semibold mb-6">About the Creator</h2>
          <div className="flex flex-col md:flex-row items-center gap-8 bg-gray-800 p-6 rounded-lg">
            {/* Creator Photo */}
            <div className="w-32 h-32 md:w-48 md:h-48 bg-gray-600 rounded-full overflow-hidden flex items-center justify-center">
              <img src={privateUrl} alt="Creator Photo" />
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-2">Krittin Chuaiphikroh</h3>
              <p className="text-lg">
                To become a future engineer, you must make sure your weather data is clean and accurate.<br></br>
                Do not disappoint your god and savior, the great and powerful, REDACTED.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default LandingPage;
