import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';

export default function DraftLetterPrompt({ onClose }) {
  const { 
    report, 
    generateDraftCommunication, 
    setShouldGenerateLetter,
    openaiApiKey
  } = useAppContext();
  const [error, setError] = useState(null);

  const handleGenerateLetter = async () => {
    if (!openaiApiKey) {
      setError('OpenAI API key is required. Please add your API key in the Settings page before generating a letter.');
      return;
    }
    
    setShouldGenerateLetter(true);
    onClose();
  };

  const handleSkip = () => {
    setShouldGenerateLetter(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-lg w-full mx-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Generate Draft Letter</h2>
        
        <p className="text-gray-600 mb-4">
          Would you like to generate a draft letter based on the analysis? 
          This will create a professional communication that you can edit and send.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p>{error}</p>
          </div>
        )}
        
        {!openaiApiKey && (
          <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700">
            <p className="font-medium">API Key Required</p>
            <p className="mt-1">
              You need to provide an OpenAI API key to generate a letter. Please go to the Settings page to add your API key.
            </p>
          </div>
        )}
        
        <div className="flex justify-end gap-3 mt-6">
          <Button 
            variant="secondary" 
            onClick={handleSkip}
          >
            Skip
          </Button>
          
          <Button 
            onClick={handleGenerateLetter}
            disabled={!openaiApiKey}
          >
            Generate Letter
          </Button>
        </div>
      </div>
    </div>
  );
}