"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Environment variable for backend URL
const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const EditProfilePage = () => {
  const router = useRouter();
  const [displayName, setDisplayName] = useState("");
  const [preferredTemperatureUnit, setPreferredTemperatureUnit] = useState(0);
  const [preferredWindSpeedUnit, setPreferredWindSpeedUnit] = useState(0);
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [token, setToken] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null); // Track whether the operation was successful

  // Fetch user profile data to pre-populate the form
  useEffect(() => {
    const authToken = localStorage.getItem("token");
    if (!authToken) {
      router.push("/login");
      return;
    }
    setToken(authToken);

    // Fetch the current user profile
    fetch(`${BACKEND_URL}/user/`, {
      method: "GET",
      headers: {
        Authorization: `Token ${authToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.detail === "Invalid token.") {
          // Redirect to login if token is invalid
          router.push("/login");
        } else {
          // Set profile data if token is valid
          setDisplayName(data.display_name);
          setPreferredTemperatureUnit(data.preferred_temperature_unit);
          setPreferredWindSpeedUnit(data.preferred_wind_speed_unit);
        }
      })
      .catch(() => {
        setMessage("Failed to load user data.");
        setIsSuccess(false);
      });
  }, [router]);

  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setMessage("Authentication token is missing.");
      setIsSuccess(false);
      return;
    }

    if (password !== passwordConfirm) {
      setMessage("Passwords do not match. Please try again.");
      setIsSuccess(false);
      return;
    }

    const payload: any = {
      display_name: displayName,
      preferred_temperature_unit: preferredTemperatureUnit,
      preferred_wind_speed_unit: preferredWindSpeedUnit,
    };

    // Add password to payload if it's provided
    if (password) {
      payload.password = password;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/user/`, {
        method: "PATCH",
        headers: {
          Authorization: `Token ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setDisplayName(updatedData.display_name);
        setPreferredTemperatureUnit(updatedData.preferred_temperature_unit);
        setPreferredWindSpeedUnit(updatedData.preferred_wind_speed_unit);
        setMessage("Profile updated successfully.");
        setIsSuccess(true);
      } else {
        const errorData = await response.json();
        if (errorData.error) {
          setMessage(errorData.error);
        } else {
          setMessage("Failed to update profile.");
        }
        setIsSuccess(false);
      }
    } catch (error) {
      setMessage("An error occurred. Please try again later.");
      setIsSuccess(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 rounded-lg">
      <h1 className="text-2xl font-semibold text-white mb-4">Edit Profile</h1>

      {message && (
        <div className={`p-2 rounded mb-4 ${isSuccess ? 'bg-blue-500 text-white' : 'bg-red-500 text-white'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div>
          <label className="block text-white">Display Name</label>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block text-white">Preferred Temperature Unit</label>
          <select
            value={preferredTemperatureUnit}
            onChange={(e) =>
              setPreferredTemperatureUnit(parseInt(e.target.value))
            }
            className="w-full p-2 rounded bg-gray-700 text-white"
          >
            <option value={0}>Celsius (°C)</option>
            <option value={1}>Fahrenheit (°F)</option>
          </select>
        </div>

        <div>
          <label className="block text-white">Preferred Wind Speed Unit</label>
          <select
            value={preferredWindSpeedUnit}
            onChange={(e) =>
              setPreferredWindSpeedUnit(parseInt(e.target.value))
            }
            className="w-full p-2 rounded bg-gray-700 text-white"
          >
            <option value={0}>km/h</option>
            <option value={1}>knots</option>
          </select>
        </div>

        <div>
          <label className="block text-white">New Password (optional)</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <div>
          <label className="block text-white">New Password (again)</label>
          <input
            type="password"
            value={passwordConfirm}
            onChange={(e) => setPasswordConfirm(e.target.value)}
            className="w-full p-2 rounded bg-gray-700 text-white"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 p-2 rounded text-white hover:bg-blue-600"
        >
          Update Profile
        </button>
      </form>
    </div>
  );
};

export default EditProfilePage;
