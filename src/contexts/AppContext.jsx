import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Sentry from '@sentry/browser';

const AppContext = createContext();

export function useAppContext() {
  return useContext(AppContext);
}

export function AppProvider({ children }) {
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
  const [savedReports, setSavedReports] = useState(() => {
    try {
      const saved = localStorage.getItem('savedReports');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error loading saved reports:', error);
      return [];
    }
  });

  // Save reports to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('savedReports', JSON.stringify(savedReports));
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error saving reports to localStorage:', error);
    }
  }, [savedReports]);
  
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
  
  // Generate report using GPT-4o
  const generateReport = async () => {
    try {
      setIsGeneratingReport(true);
      console.log('Generating report for:', projectDetails);
      
      const response = await fetch('/api/generateReport', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ projectDetails }),
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
        },
        body: JSON.stringify({ report: reportData }),
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
  
  // Save current report
  const saveCurrentReport = () => {
    if (!report) return;
    
    setSavedReports(prev => {
      // Check if report with same ID already exists
      const exists = prev.some(r => r.id === report.id);
      if (exists) {
        // Update existing report
        return prev.map(r => r.id === report.id ? report : r);
      } else {
        // Add new report
        return [...prev, report];
      }
    });
  };
  
  // Delete a saved report
  const deleteSavedReport = (reportId) => {
    setSavedReports(prev => prev.filter(r => r.id !== reportId));
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
    generateReport,
    isGeneratingReport,
    draftCommunication,
    generateDraftCommunication,
    isGeneratingLetter,
    savedReports,
    saveCurrentReport,
    deleteSavedReport,
    shouldGenerateLetter,
    setShouldGenerateLetter
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}