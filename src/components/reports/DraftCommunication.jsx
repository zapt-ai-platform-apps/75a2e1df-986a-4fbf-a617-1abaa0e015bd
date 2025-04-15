import React, { forwardRef } from 'react';

const DraftCommunication = forwardRef(({ draftCommunication }, ref) => {
  if (!draftCommunication) {
    return (
      <div className="p-6 border border-gray-200 rounded-lg bg-white text-center">
        <p className="text-gray-600">No draft communication available.</p>
      </div>
    );
  }
  
  return (
    <div 
      ref={ref} 
      className="p-6 border border-gray-200 rounded-lg bg-white mb-6"
    >
      <div className="max-w-2xl mx-auto">
        <div className="mb-6">
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600">To:</p>
            <p className="text-gray-800">{draftCommunication.to}</p>
          </div>
          
          <div className="mb-4">
            <p className="text-sm font-medium text-gray-600">Subject:</p>
            <p className="text-gray-800">{draftCommunication.subject}</p>
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-800">{draftCommunication.greeting}</p>
        </div>
        
        <div className="mb-4 whitespace-pre-line">
          <p className="text-gray-800">{draftCommunication.body}</p>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-800">{draftCommunication.closing}</p>
        </div>
        
        <div className="whitespace-pre-line">
          <p className="text-gray-800">{draftCommunication.sender}</p>
        </div>
        
        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600 italic">
            Note: This is a draft communication only. Please review and edit as needed before sending.
          </p>
        </div>
      </div>
    </div>
  );
});

DraftCommunication.displayName = 'DraftCommunication';

export default DraftCommunication;