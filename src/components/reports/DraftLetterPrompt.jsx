import React from 'react';
import Button from '../common/Button';
import { FaEnvelope, FaTimes } from 'react-icons/fa';

export default function DraftLetterPrompt({ onResponse }) {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6 text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Draft Communication</h2>
      
      <div className="mb-8 bg-blue-50 p-6 rounded-lg">
        <p className="text-gray-700 mb-4">
          Would you like us to prepare a draft formal letter that you can send to the other party regarding the contract issues you've described?
        </p>
        
        <p className="text-gray-700 mb-4">
          This professional draft letter will outline the key contractual issues, reference relevant contract clauses, and propose appropriate next steps in accordance with the contract.
        </p>
        
        <p className="text-gray-700 font-medium">
          You'll be able to review, edit, and export the letter before sending it to maintain full control over the communication.
        </p>
      </div>
      
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => onResponse(true)}
          size="md"
          variant="success"
          icon={<FaEnvelope />}
        >
          Yes, Create Draft Letter
        </Button>
        
        <Button 
          onClick={() => onResponse(false)}
          size="md"
          variant="secondary"
          icon={<FaTimes />}
        >
          No, Just Show Report
        </Button>
      </div>
    </div>
  );
}