import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Sentry from '@sentry/browser';
import useAuth from '@/hooks/useAuth';

const AppContext = createContext();

export function useAppContext() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
  const { user, session } = useAuth();
  
  // Consent state
  const [hasConsented, setHasConsented] = useState(false);
  
  // Project details state
  const [projectDetails, setProjectDetails] = useState({
    projectName: '',
    projectDescription: '',
    contractType: '',
    organizationRole: '',
    issues: [{ description: '', actionsTaken: '' }]
  });
  
  // Generated report state
  const [report, setReport] = useState(null);
  const [draftCommunication, setDraftCommunication] = useState(null);
  const [shouldGenerateLetter, setShouldGenerateLetter] = useState(null);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  
  // Saved reports
  const [savedReports, setSavedReports] = useState([]);
  const [isFetchingSavedReports, setIsFetchingSavedReports] = useState(false);
  
  // Fetch saved reports when user is authenticated
  useEffect(() => {
    if (user && hasConsented) {
      fetchSavedReports();
    } else {
      setSavedReports([]);
    }
  }, [user, hasConsented]);
  
  // Provide consent management
  const giveConsent = () => setHasConsented(true);
  const revokeConsent = () => setHasConsented(false);
  
  // Update project details
  const updateProjectDetails = (details) => {
    setProjectDetails(prev => ({ ...prev, ...details }));
  };
  
  // Add a new issue to the project
  const addIssue = () => {
    setProjectDetails(prev => ({
      ...prev,
      issues: [...prev.issues, { description: '', actionsTaken: '' }]
    }));
  };
  
  // Update a specific issue
  const updateIssue = (index, field, value) => {
    setProjectDetails(prev => {
      const updatedIssues = [...prev.issues];
      updatedIssues[index] = { 
        ...updatedIssues[index], 
        [field]: value 
      };
      return { ...prev, issues: updatedIssues };
    });
  };
  
  // Remove an issue
  const removeIssue = (index) => {
    setProjectDetails(prev => {
      const updatedIssues = prev.issues.filter((_, i) => i !== index);
      return { ...prev, issues: updatedIssues };
    });
  };
  
  // Fetch all saved reports
  const fetchSavedReports = async () => {
    if (!session) return;
    
    try {
      setIsFetchingSavedReports(true);
      
      const response = await fetch('/api/getSavedReports', {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch saved reports');
      }

      const reports = await response.json();
      setSavedReports(reports);
      
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error fetching saved reports:', error);
    } finally {
      setIsFetchingSavedReports(false);
    }
  };
  
  // Generate report using GPT-4o
  const generateReport = async () => {
    if (!session) {
      throw new Error('You must be signed in to generate a report');
    }
    
    try {
      setIsGeneratingReport(true);
      console.log('Generating report for:', projectDetails);
      
      const response = await fetch('/api/generateReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          projectDetails
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate report');
      }

      const generatedReport = await response.json();
      console.log('Generated report:', generatedReport);
      
      setReport(generatedReport);
      return generatedReport;
      
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error generating report:', error);
      throw error;
    } finally {
      setIsGeneratingReport(false);
    }
  };
  
  // Generate draft communication using GPT-4o
  const generateDraftCommunication = async (reportData) => {
    if (!session) {
      throw new Error('You must be signed in to generate a draft letter');
    }
    
    try {
      if (!reportData) {
        throw new Error('No report data available to generate draft letter');
      }

      setIsGeneratingLetter(true);
      console.log('Generating draft letter for report:', reportData.id);
      
      const response = await fetch('/api/generateLetter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ 
          report: reportData
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate draft letter');
      }

      const generatedLetter = await response.json();
      console.log('Generated draft letter:', generatedLetter);
      
      setDraftCommunication(generatedLetter);
      return generatedLetter;
      
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error generating draft letter:', error);
      // Return null but don't throw to avoid breaking UI flow
      return null;
    } finally {
      setIsGeneratingLetter(false);
    }
  };
  
  // Save current report to database
  const saveCurrentReport = async () => {
    if (!session) {
      throw new Error('You must be signed in to save a report');
    }
    
    if (!report) return;
    
    try {
      const response = await fetch('/api/saveReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ report }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save report');
      }

      await fetchSavedReports();
      return true;
      
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error saving report:', error);
      throw error;
    }
  };
  
  // Delete a saved report
  const deleteSavedReport = async (reportId) => {
    if (!session) {
      throw new Error('You must be signed in to delete a report');
    }
    
    try {
      const response = await fetch(`/api/deleteReport?reportId=${reportId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete report');
      }

      // Update local state
      setSavedReports(prev => prev.filter(r => r.id !== reportId));
      return true;
      
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error deleting report:', error);
      throw error;
    }
  };
  
  // Provide context value
  const value = {
    hasConsented,
    giveConsent,
    revokeConsent,
    projectDetails,
    updateProjectDetails,
    addIssue,
    updateIssue,
    removeIssue,
    report,
    setReport,
    generateReport,
    isGeneratingReport,
    draftCommunication,
    generateDraftCommunication,
    isGeneratingLetter,
    savedReports,
    isFetchingSavedReports,
    saveCurrentReport,
    deleteSavedReport,
    shouldGenerateLetter,
    setShouldGenerateLetter,
    openaiApiKey: undefined // We're using environment variable now
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}