import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import DisclaimerPage from './components/disclaimer/DisclaimerPage';
import ProjectDetailsForm from './components/project/ProjectDetailsForm';
import ReportView from './components/reports/ReportView';
import SettingsPage from './components/settings/SettingsPage';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import { useAppContext } from './contexts/AppContext';
import ZaptBadge from './components/common/ZaptBadge';
import AuthRequired from './components/auth/AuthRequired';

export default function App() {
  const { hasConsented } = useAppContext();
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<DisclaimerPage />} />
          <Route 
            path="/project" 
            element={
              hasConsented ? (
                <AuthRequired>
                  <ProjectDetailsForm />
                </AuthRequired>
              ) : <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/report" 
            element={
              hasConsented ? (
                <AuthRequired>
                  <ReportView />
                </AuthRequired>
              ) : <Navigate to="/" replace />
            } 
          />
          <Route 
            path="/settings" 
            element={
              hasConsented ? (
                <AuthRequired>
                  <SettingsPage />
                </AuthRequired>
              ) : <Navigate to="/" replace />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <ZaptBadge />
      <Footer />
    </div>
  );
}