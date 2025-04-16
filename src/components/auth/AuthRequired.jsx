import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuth from '@/hooks/useAuth';
import AuthForm from './AuthForm';

export default function AuthRequired({ children }) {
  const { user, loading } = useAuth();
  
  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
      </div>
    );
  }
  
  // If not authenticated, show the auth form
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-8">
            Contract Assistant
          </h1>
          <AuthForm />
        </div>
      </div>
    );
  }
  
  // If authenticated, render the children
  return <>{children}</>;
}