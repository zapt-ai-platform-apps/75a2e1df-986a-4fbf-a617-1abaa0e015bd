import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';
import { contractTypes } from '../../data/contractTypes';
import { organizationRoles } from '../../data/organizationRoles';
import IssueForm from './IssueForm';
import { FaPlus, FaArrowRight } from 'react-icons/fa';

export default function ProjectDetailsForm() {
  const { 
    projectDetails, 
    updateProjectDetails, 
    addIssue, 
    updateIssue, 
    removeIssue,
    generateReport 
  } = useAppContext();
  
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    updateProjectDetails({ [name]: value });
    
    // Clear validation error when field is updated
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
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
    
    projectDetails.issues.forEach((issue, index) => {
      if (!issue.description.trim()) {
        errors[`issue_${index}_description`] = 'Issue description is required';
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await generateReport();
      navigate('/report');
    } catch (error) {
      console.error('Error generating report:', error);
      alert('An error occurred while generating the report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Project Details</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="space-y-6">
          {/* Project Name */}
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              id="projectName"
              name="projectName"
              value={projectDetails.projectName}
              onChange={handleChange}
              className={`box-border w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.projectName ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter project name"
            />
            {validationErrors.projectName && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.projectName}</p>
            )}
          </div>
          
          {/* Project Description */}
          <div>
            <label htmlFor="projectDescription" className="block text-sm font-medium text-gray-700 mb-1">
              Project Description *
            </label>
            <textarea
              id="projectDescription"
              name="projectDescription"
              value={projectDetails.projectDescription}
              onChange={handleChange}
              rows="3"
              className={`box-border w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.projectDescription ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Briefly describe the project"
            ></textarea>
            {validationErrors.projectDescription && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.projectDescription}</p>
            )}
          </div>
          
          {/* Form of Contract */}
          <div>
            <label htmlFor="contractType" className="block text-sm font-medium text-gray-700 mb-1">
              Form of Contract *
            </label>
            <select
              id="contractType"
              name="contractType"
              value={projectDetails.contractType}
              onChange={handleChange}
              className={`box-border w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.contractType ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select contract type</option>
              {contractTypes.map((contract, index) => (
                <option key={index} value={contract}>
                  {contract}
                </option>
              ))}
            </select>
            {validationErrors.contractType && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.contractType}</p>
            )}
          </div>
          
          {/* Organization Role */}
          <div>
            <label htmlFor="organizationRole" className="block text-sm font-medium text-gray-700 mb-1">
              Your Organization's Role Under the Contract *
            </label>
            <select
              id="organizationRole"
              name="organizationRole"
              value={projectDetails.organizationRole}
              onChange={handleChange}
              className={`box-border w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                validationErrors.organizationRole ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select your role</option>
              {organizationRoles.map((role, index) => (
                <option key={index} value={role}>
                  {role}
                </option>
              ))}
            </select>
            {validationErrors.organizationRole && (
              <p className="mt-1 text-sm text-red-600">{validationErrors.organizationRole}</p>
            )}
          </div>
          
          {/* Issues Section */}
          <div className="mt-8">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Contract Issues</h3>
            
            {projectDetails.issues.map((issue, index) => (
              <IssueForm
                key={index}
                issue={issue}
                index={index}
                updateIssue={updateIssue}
                removeIssue={removeIssue}
                isRemovable={projectDetails.issues.length > 1}
                validationErrors={validationErrors}
              />
            ))}
            
            <div className="mt-4">
              <Button
                type="button"
                onClick={addIssue}
                className="bg-gray-600 hover:bg-gray-700"
                icon={<FaPlus />}
              >
                Add Another Issue
              </Button>
            </div>
          </div>
          
          <div className="pt-6 border-t border-gray-200 mt-8">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="ml-auto"
              icon={<FaArrowRight />}
            >
              {isSubmitting ? 'Generating Report...' : 'Generate Report'}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}