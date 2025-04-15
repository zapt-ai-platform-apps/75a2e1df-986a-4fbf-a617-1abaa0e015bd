import React from 'react';
import Button from '../common/Button';

export default function DraftLetterPrompt({ onResponse }) {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Draft Communication</h2>
      
      <div className="mb-8 bg-blue-50 p-6 rounded-lg">
        <p className="text-gray-700 mb-4">
          Would you like us to prepare a draft letter that you can send to the other party regarding the contract issues you've described?
        </p>
        
        <p className="text-gray-700 mb-4">
          This draft letter will outline the key issues, reference relevant contract clauses, and propose appropriate next steps.
        </p>
        
        <p className="text-gray-700 font-medium">
          You'll be able to review, edit, and export the letter before sending it.
        </p>
      </div>
      
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => onResponse(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          Yes, Create Draft Letter
        </Button>
        
        <Button 
          onClick={() => onResponse(false)}
          className="bg-gray-600 hover:bg-gray-700"
        >
          No, Just Show Report
        </Button>
      </div>
    </div>
  );
}