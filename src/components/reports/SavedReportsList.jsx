import React from 'react';
import Button from '../common/Button';
import { FaTrash, FaArrowRight, FaTimes } from 'react-icons/fa';

export default function SavedReportsList({ savedReports, onClose, onLoad, onDelete }) {
  if (savedReports.length === 0) {
    return (
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 text-center">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Saved Reports</h2>
          <Button
            onClick={onClose}
            className="bg-gray-600 hover:bg-gray-700 px-2 py-1"
            icon={<FaTimes />}
          >
            Close
          </Button>
        </div>
        
        <p className="text-gray-600 mb-6">You don't have any saved reports yet.</p>
        
        <Button 
          onClick={onClose}
          className="mx-auto"
        >
          Return to Current Report
        </Button>
      </div>
    );
  }
  
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Saved Reports</h2>
        <Button
          onClick={onClose}
          className="bg-gray-600 hover:bg-gray-700 px-2 py-1"
          icon={<FaTimes />}
        >
          Close
        </Button>
      </div>
      
      <div className="space-y-4">
        {savedReports.map((report) => (
          <div 
            key={report.id} 
            className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  {report.projectDetails.projectName}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(report.date).toLocaleDateString()} - {report.projectDetails.contractType}
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => onLoad(report)}
                  className="bg-blue-600 hover:bg-blue-700"
                  icon={<FaArrowRight />}
                >
                  Load
                </Button>
                
                <Button
                  onClick={() => onDelete(report.id)}
                  className="bg-red-600 hover:bg-red-700"
                  icon={<FaTrash />}
                >
                  Delete
                </Button>
              </div>
            </div>
            
            <div>
              <p className="text-gray-700 text-sm line-clamp-2">
                {report.projectDetails.projectDescription}
              </p>
              <p className="text-gray-700 text-sm mt-1">
                <span className="font-medium">Issues:</span> {report.analysis.length}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}