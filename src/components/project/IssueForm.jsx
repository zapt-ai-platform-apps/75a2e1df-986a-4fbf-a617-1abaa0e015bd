import React from 'react';
import Button from '../common/Button';
import { FaTrash } from 'react-icons/fa';

export default function IssueForm({
  issue,
  index,
  updateIssue,
  removeIssue,
  isRemovable,
  validationErrors
}) {
  const handleChange = (field, value) => {
    updateIssue(index, field, value);
  };
  
  return (
    <div className="p-4 border border-gray-200 rounded-lg mb-4 bg-gray-50">
      <div className="flex justify-between items-center mb-3">
        <h4 className="text-md font-medium">Issue #{index + 1}</h4>
        
        {isRemovable && (
          <Button
            type="button"
            onClick={() => removeIssue(index)}
            className="bg-red-600 hover:bg-red-700 px-2 py-1"
            icon={<FaTrash size={14} />}
          >
            Remove
          </Button>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Issue Description */}
        <div>
          <label htmlFor={`issue_${index}_description`} className="block text-sm font-medium text-gray-700 mb-1">
            Please describe the specific issue *
          </label>
          <textarea
            id={`issue_${index}_description`}
            value={issue.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows="3"
            className={`box-border w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              validationErrors[`issue_${index}_description`] ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Describe the contract issue in detail"
          ></textarea>
          {validationErrors[`issue_${index}_description`] && (
            <p className="mt-1 text-sm text-red-600">{validationErrors[`issue_${index}_description`]}</p>
          )}
        </div>
        
        {/* Actions Taken */}
        <div>
          <label htmlFor={`issue_${index}_actions`} className="block text-sm font-medium text-gray-700 mb-1">
            What action, if any, have you taken to date?
          </label>
          <textarea
            id={`issue_${index}_actions`}
            value={issue.actionsTaken}
            onChange={(e) => handleChange('actionsTaken', e.target.value)}
            rows="2"
            className="box-border w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Describe any actions you've already taken regarding this issue"
          ></textarea>
        </div>
      </div>
    </div>
  );
}