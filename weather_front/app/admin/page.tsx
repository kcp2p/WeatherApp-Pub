"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';

// Registering the required components for Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const AdminDashboard: React.FC = () => {
  const [role, setRole] = useState<string | null>(null);
  const [apiLogs, setApiLogs] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  // Check if user has admin role
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const fetchRole = async () => {
      try {
        const response = await axios.get(`${backendUrl}/role/`, {
          headers: { Authorization: `Token ${token}` },
        });
        if (response.data.role !== 'admin') {
          router.push('/dashboard'); // Redirect non-admins to the dashboard
        } else {
          setRole('admin');
        }
      } catch (error) {
        console.error("Failed to fetch role", error);
        router.push('/login');
      }
    };

    fetchRole();
  }, [backendUrl, router]);

  // Fetch API logs
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token || role !== 'admin') return;

    const fetchApiLogs = async () => {
      try {
        const response = await axios.get(`${backendUrl}/admin/api-logs/`, {
          headers: { Authorization: `Token ${token}` },
        });
        setApiLogs(response.data);
      } catch (error) {
        setError("Failed to fetch API logs");
        console.error("Error fetching API logs:", error);
      }
    };

    fetchApiLogs();
  }, [backendUrl, role]);

  // Fetch all users
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (role === 'admin' && token) {
      const fetchUsers = async () => {
        try {
          const response = await axios.get(`${backendUrl}/admin/users/`, {
            headers: { Authorization: `Token ${token}` },
          });
          setUsers(response.data);
        } catch (error) {
          setError("Failed to fetch users");
          console.error("Error fetching users:", error);
        }
      };

      fetchUsers();
    }
  }, [backendUrl, role]);

  // Clear all cache
  const handleClearCache = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`${backendUrl}/admin/cache/`, {
        headers: { Authorization: `Token ${token}` },
      });
      alert('Cache cleared successfully');
    } catch (error) {
      setError("Failed to clear cache");
    }
  };

  // Clear cache for specific city
  const handleClearCityCache = async (cityName: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await axios.delete(`${backendUrl}/admin/cache/${cityName}`, {
        headers: { Authorization: `Token ${token}` },
      });
      alert(`Cache for ${cityName} cleared successfully`);
    } catch (error) {
      setError("Failed to clear cache for city");
    }
  };

  // Handle pagination
  const totalPages = Math.ceil(apiLogs.length / itemsPerPage);
  const paginatedLogs = apiLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Prepare data for charts
  const apiLogCities = (apiLogs || []).map((log) => log.city_name);
  const cityFrequency = apiLogCities.reduce((acc: any, city: string) => {
    acc[city] = (acc[city] || 0) + 1;
    return acc;
  }, {});

  const userTemperaturePreferences = users.reduce(
    (acc, user) => {
      acc[user.preferred_temperature_unit] += 1;
      return acc;
    },
    [0, 0] // index 0: Celsius, index 1: Fahrenheit
  );

  const userWindSpeedPreferences = users.reduce(
    (acc, user) => {
      acc[user.preferred_wind_speed_unit] += 1;
      return acc;
    },
    [0, 0] // index 0: km/h, index 1: knots
  );

  // Handle navigation to Dashboard
  const handleGoToDashboard = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="max-w-6xl mx-auto">

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Admin Dashboard</h1>
          <button
            onClick={handleGoToDashboard}
            className="py-2 px-4 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300"
          >
            Go to Dashboard
          </button>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">API Logs</h2>
          <div className="overflow-x-auto bg-gray-800 p-4 rounded-lg mb-6">
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="text-left p-2">ID</th>
                  <th className="text-left p-2">User</th>
                  <th className="text-left p-2">City Name</th>
                  <th className="text-left p-2">Request Time</th>
                  <th className="text-left p-2">Response Status</th>
                </tr>
              </thead>
              <tbody>
                {paginatedLogs.length > 0 ? (
                  paginatedLogs.map((log) => (
                    <tr key={log.id}>
                      <td className="p-2">{log.id}</td>
                      <td className="p-2">{log.user}</td>
                      <td className="p-2">{log.city_name}</td>
                      <td className="p-2">{new Date(log.request_time).toLocaleString()}</td>
                      <td className="p-2">{log.response_status}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center p-4">No API logs available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="py-2 px-4 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-lg whitespace-nowrap">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="py-2 px-4 bg-blue-500 rounded-lg hover:bg-blue-600 transition duration-300 disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>

        {/* Visualization Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">City Frequency in API Logs</h3>
            <Pie
              data={{
                labels: Object.keys(cityFrequency),
                datasets: [
                  {
                    label: 'Requests by City',
                    data: Object.values(cityFrequency),
                    backgroundColor: [
                      'rgba(255, 99, 132, 0.2)',
                      'rgba(54, 162, 235, 0.2)',
                      'rgba(255, 206, 86, 0.2)',
                      'rgba(75, 192, 192, 0.2)',
                      'rgba(153, 102, 255, 0.2)',
                    ],
                    borderColor: [
                      'rgba(255, 99, 132, 1)',
                      'rgba(54, 162, 235, 1)',
                      'rgba(255, 206, 86, 1)',
                      'rgba(75, 192, 192, 1)',
                      'rgba(153, 102, 255, 1)',
                    ],
                    borderWidth: 1,
                  },
                ],
              }}
            />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">User Temperature Preferences</h3>
            <Bar
              data={{
                labels: ['Celsius', 'Fahrenheit'],
                datasets: [
                  {
                    label: '# of Users',
                    data: userTemperaturePreferences,
                    backgroundColor: ['rgba(54, 162, 235, 0.2)', 'rgba(255, 99, 132, 0.2)'],
                    borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 99, 132, 1)'],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
          <div className="bg-gray-800 p-4 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">User Wind Speed Preferences</h3>
            <Bar
              data={{
                labels: ['km/h', 'knots'],
                datasets: [
                  {
                    label: '# of Users',
                    data: userWindSpeedPreferences,
                    backgroundColor: ['rgba(153, 102, 255, 0.2)', 'rgba(255, 206, 86, 0.2)'],
                    borderColor: ['rgba(153, 102, 255, 1)', 'rgba(255, 206, 86, 1)'],
                    borderWidth: 1,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: 'top',
                  },
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
