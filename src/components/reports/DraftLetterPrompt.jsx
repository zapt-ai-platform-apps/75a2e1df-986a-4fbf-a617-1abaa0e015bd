import React from 'react';
import Button from '../common/Button';
import { FaCheck, FaTimes } from 'react-icons/fa';

export default function DraftLetterPrompt({ onResponse }) {
  return (
    <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Draft Communication</h2>
      
      <div className="mb-6">
        <p className="text-gray-700 mb-4">
          Would you like us to create a draft letter based on your contract analysis report? 
          This letter will focus specifically on the issue(s) you've reported and can be used as 
          a starting point for formal communication with the other party.
        </p>
        <p className="text-gray-700">
          The letter will reference the specific contractual clauses relevant to your issue(s)
          and outline your position in a professional manner.
        </p>
      </div>
      
      <div className="flex justify-center gap-4">
        <Button
          onClick={() => onResponse(true)}
          variant="primary"
          icon={<FaCheck />}
        >
          Yes, create draft letter
        </Button>
        
        <Button
          onClick={() => onResponse(false)}
          variant="secondary"
          icon={<FaTimes />}
        >
          No, skip this step
        </Button>
      </div>
    </div>
  );
}