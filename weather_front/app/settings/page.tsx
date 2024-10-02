// app/settings/page.tsx
import React from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { useRouter } from 'next/navigation';

interface SettingsForm {
  preferred_temperature_unit?: string;
  preferred_wind_speed_unit?: string;
}

const Settings: React.FC = () => {
  const { register, handleSubmit } = useForm<SettingsForm>();
  const router = useRouter();

  const onSubmit = async (data: SettingsForm) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/api/settings', data, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Settings updated successfully');
    } catch (error) {
      alert('Error updating settings');
    }
  };

  const deleteAccount = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete('/api/delete-account', {
        headers: { Authorization: `Bearer ${token}` },
      });
      localStorage.removeItem('token');
      alert('Account deleted successfully');
      router.push('/register');
    } catch (error) {
      alert('Error deleting account');
    }
  };

  return (
    <div className="container">
      <h2>Settings</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        <input {...register('preferred_temperature_unit')} placeholder="Preferred Temperature Unit" />
        <input {...register('preferred_wind_speed_unit')} placeholder="Preferred Wind Speed Unit" />
        <button type="submit">Save Settings</button>
      </form>
      <button onClick={deleteAccount} className="delete-btn">
        Delete Account
      </button>
    </div>
  );
};

export default Settings;
