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
  
  // Generate report
  const generateReport = async () => {
    try {
      // This would typically be an API call to a backend service
      // For demonstration purposes, we'll simulate the report generation
      console.log('Generating report for:', projectDetails);
      
      // Simulate report generation
      const generatedReport = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        projectDetails: { ...projectDetails },
        analysis: projectDetails.issues.map(issue => ({
          issue: issue.description,
          actionsTaken: issue.actionsTaken,
          relevantClauses: generateRelevantClauses(projectDetails.contractType, issue.description),
          recommendations: generateRecommendations(projectDetails.contractType, projectDetails.organizationRole, issue.description),
        })),
      };
      
      setReport(generatedReport);
      generateDraftCommunication(generatedReport);
      
      return generatedReport;
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error generating report:', error);
      throw error;
    }
  };
  
  // Generate draft communication
  const generateDraftCommunication = (reportData) => {
    try {
      // This would typically be an API call or complex logic
      // Simulating draft generation
      const draft = {
        to: getDraftRecipient(projectDetails.organizationRole),
        subject: `Contract Issue: ${projectDetails.projectName}`,
        greeting: "Dear Sir/Madam,",
        body: `I am writing regarding ${projectDetails.projectName}.\n\n` +
              `As the ${projectDetails.organizationRole} under the ${projectDetails.contractType} contract, ` +
              `I wish to bring to your attention the following contract issue(s):\n\n` +
              reportData.analysis.map((analysis, index) => 
                `Issue ${index + 1}: ${analysis.issue}\n` +
                `Relevant Contract Clauses: ${analysis.relevantClauses.join(', ')}\n` +
                `Proposed Resolution: ${analysis.recommendations[0]}\n`
              ).join('\n\n') +
              `\nI look forward to resolving this matter in accordance with the contract terms.`,
        closing: "Yours faithfully,",
        sender: "[Your Name]\n[Your Position]\n[Your Company]"
      };
      
      setDraftCommunication(draft);
      return draft;
    } catch (error) {
      Sentry.captureException(error);
      console.error('Error generating draft communication:', error);
      return null;
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
  
  // Helper functions for report generation
  function generateRelevantClauses(contractType, issueDescription) {
    // This would be a sophisticated function in a real application
    // Simplified for demonstration
    const issueKeywords = issueDescription.toLowerCase();
    
    if (contractType.includes('JCT')) {
      if (issueKeywords.includes('payment')) return ['Clause 4.8', 'Clause 4.9', 'Clause 4.10'];
      if (issueKeywords.includes('delay')) return ['Clause 2.26', 'Clause 2.27', 'Clause 2.28', 'Clause 2.29'];
      if (issueKeywords.includes('variation')) return ['Clause 3.14', 'Clause 3.15', 'Clause 3.16'];
      return ['Clause 1.8', 'Clause 2.1'];
    }
    
    if (contractType.includes('NEC')) {
      if (issueKeywords.includes('payment')) return ['Clause 50', 'Clause 51'];
      if (issueKeywords.includes('delay')) return ['Clause 60', 'Clause 61', 'Clause 62'];
      if (issueKeywords.includes('variation')) return ['Clause 60.1(1)', 'Clause 63'];
      return ['Clause 10.1', 'Clause 91.1'];
    }
    
    return ['General Contract Provisions', 'Specific Terms of Agreement'];
  }
  
  function generateRecommendations(contractType, role, issueDescription) {
    // Simplified recommendation generator
    const recommendations = [];
    const issueKeywords = issueDescription.toLowerCase();
    
    if (issueKeywords.includes('payment')) {
      recommendations.push('Submit a formal payment notice in accordance with contract terms.');
      recommendations.push('Prepare detailed records of work completed and costs incurred.');
      if (role.includes('Contractor')) {
        recommendations.push('Consider suspension of work if payment is significantly overdue, following proper notification procedures.');
      }
    }
    
    if (issueKeywords.includes('delay')) {
      recommendations.push('Document all causes of delay with specific dates and impacts.');
      recommendations.push('Submit extension of time request with supporting evidence.');
      recommendations.push('Maintain detailed records of all project activities and correspondence.');
    }
    
    if (issueKeywords.includes('variation')) {
      recommendations.push('Submit variation order request with detailed cost and time implications.');
      recommendations.push('Ensure all changes are documented and approved before proceeding.');
      recommendations.push('Maintain a variation register with status updates.');
    }
    
    // Default recommendations
    if (recommendations.length === 0) {
      recommendations.push('Review the specific contract clauses related to this issue.');
      recommendations.push('Document all relevant facts and communications.');
      recommendations.push('Seek early resolution through contractual mechanisms.');
      recommendations.push('Consider formal correspondence outlining your position.');
    }
    
    return recommendations;
  }
  
  function getDraftRecipient(role) {
    // Determine appropriate recipient based on role
    if (role.includes('Client') || role.includes('Employer')) {
      return 'Contractor';
    } else if (role.includes('Contractor')) {
      return 'Client/Employer';
    } else if (role.includes('Sub-contractor')) {
      return 'Main Contractor';
    }
    return 'Contract Administrator';
  }
  
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
    draftCommunication,
    generateDraftCommunication,
    savedReports,
    saveCurrentReport,
    deleteSavedReport
  };
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}