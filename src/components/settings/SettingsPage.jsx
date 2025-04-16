import React from 'react';
import ApiKeySettings from './ApiKeySettings';
import { useAppContext } from '../../contexts/AppContext';
import { Navigate } from 'react-router-dom';

export default function SettingsPage() {
  const { hasConsented } = useAppContext();
  
  if (!hasConsented) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Settings</h1>
      <ApiKeySettings />
    </div>
  );
}