import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';
import contractTypes from '../../data/contractTypes';
import { organizationRoles } from '../../data/organizationRoles';
import IssueForm from './IssueForm';

export default function ProjectDetailsForm() {
  const { 
    projectDetails, 
    updateProjectDetails, 
    addIssue, 
    updateIssue, 
    removeIssue, 
    generateReport, 
    setReport,
    isGeneratingReport,
    openaiApiKey
  } = useAppContext();
  
  const [validationErrors, setValidationErrors] = useState({});
  const [apiError, setApiError] = useState(null);
  const navigate = useNavigate();
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    
    // Validate form
    const errors = {};
    if (!projectDetails.projectName.trim()) {
      errors.projectName = 'Project name is required';
    }
    if (!projectDetails.projectDescription.trim()) {
      errors.projectDescription = 'Project description is required';
    }
    if (!projectDetails.contractType) {
      errors.contractType = 'Contract type is required';
    }
    if (!projectDetails.organizationRole) {
      errors.organizationRole = 'Organization role is required';
    }
    
    // Validate issues
    const issueErrors = {};
    let hasIssueErrors = false;
    
    projectDetails.issues.forEach((issue, index) => {
      if (!issue.description.trim()) {
        issueErrors[`issue_${index}_description`] = 'Issue description is required';
        hasIssueErrors = true;
      }
    });
    
    if (Object.keys(errors).length > 0 || hasIssueErrors) {
      setValidationErrors({ ...errors, ...issueErrors });
      return;
    }
    
    // Check if API key is set
    if (!openaiApiKey) {
      setApiError('OpenAI API key is required. Please add your API key in the Settings page before generating a report.');
      return;
    }
    
    // Clear validation errors
    setValidationErrors({});
    
    try {
      // Generate report
      const generatedReport = await generateReport();
      
      // Navigate to report view
      navigate('/report');
      
    } catch (error) {
      console.error('Error generating report:', error);
      setApiError(error.message || 'Failed to generate report. Please try again.');
    }
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    updateProjectDetails({ [name]: value });
    
    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors(prev => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Project Details</h1>
      
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {apiError && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-medium">Error</p>
            <p>{apiError}</p>
          </div>
        )}
        
        <div className="mb-6">
          <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
            Project Name
          </label>
          <input
            type="text"
            id="projectName"
            name="projectName"
            className={`box-border w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.projectName ? 'border-red-500' : 'border-gray-300'
            }`}
            value={projectDetails.projectName}
            onChange={handleInputChange}
          />
          {validationErrors.projectName && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.projectName}</p>
          )}
        </div>
        
        <div className="mb-6">
          <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
            Project Description
          </label>
          <textarea
            id="projectDescription"
            name="projectDescription"
            rows="3"
            className={`box-border w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
              validationErrors.projectDescription ? 'border-red-500' : 'border-gray-300'
            }`}
            value={projectDetails.projectDescription}
            onChange={handleInputChange}
          ></textarea>
          {validationErrors.projectDescription && (
            <p className="mt-1 text-sm text-red-600">{validationErrors.projectDescription}</p>
          )}
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label htmlFor="contractType" className="block text-sm font-medium text-gray-700 mb-1">
              Contract Type
            </label>
            <select
              id="contractType"
              name="contractType"
              className={`box-border w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.contractType ? 'border-red-500' : 'border-gray-300'
              }`}
              value={projectDetails.contractType}
              onChange={handleInputChange}
            >
              <option value="">Select a contract type</option>
              {contractTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {validationErrors.contractType && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.contractType}</p>
            )}
          </div>
          
          <div>
            <label htmlFor="organizationRole" className="block text-sm font-medium text-gray-700 mb-1">
              Your Organization's Role
            </label>
            <select
              id="organizationRole"
              name="organizationRole"
              className={`box-border w-full p-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 ${
                validationErrors.organizationRole ? 'border-red-500' : 'border-gray-300'
              }`}
              value={projectDetails.organizationRole}
              onChange={handleInputChange}
            >
              <option value="">Select your role</option>
              {organizationRoles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {validationErrors.organizationRole && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.organizationRole}</p>
            )}
          </div>
        </div>
        
        <div className="mb-6">
          <h2 className="text-lg font-medium text-gray-800 mb-3">Contract Issues</h2>
          <p className="text-sm text-gray-600 mb-4">
            Describe the contract issues you're facing. Add as many issues as needed.
          </p>
          
          {projectDetails.issues.map((issue, index) => (
            <IssueForm
              key={index}
              index={index}
              issue={issue}
              updateIssue={updateIssue}
              removeIssue={removeIssue}
              showRemoveButton={projectDetails.issues.length > 1}
              validationErrors={validationErrors}
            />
          ))}
          
          <div className="mt-4">
            <button
              type="button"
              onClick={addIssue}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center cursor-pointer"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
              Add Another Issue
            </button>
          </div>
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isGeneratingReport}
            isLoading={isGeneratingReport}
            loadingText="Generating Report..."
          >
            Generate Report
          </Button>
        </div>
      </form>
      
      {!openaiApiKey && (
        <div className="mt-6 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700">
          <p className="font-medium">API Key Required</p>
          <p className="mt-1">
            You need to provide an OpenAI API key to generate reports. Please go to the 
            <a href="/settings" className="text-blue-600 hover:text-blue-800 mx-1">Settings page</a>
            to add your API key.
          </p>
        </div>
      )}
    </div>
  );
}