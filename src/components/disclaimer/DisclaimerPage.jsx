import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';

export default function DisclaimerPage() {
  const { hasConsented, giveConsent } = useAppContext();
  const navigate = useNavigate();
  
  const handleAccept = () => {
    giveConsent();
    navigate('/project');
  };
  
  const handleDecline = () => {
    // Show exit message but stay on page
    document.getElementById('exitMessage').classList.remove('hidden');
  };
  
  if (hasConsented) {
    navigate('/project');
    return null;
  }
  
  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg p-8 mt-4">
      <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Welcome to Contract Assistant
      </h1>
      
      <div className="mb-8 bg-blue-50 p-6 rounded-lg">
        <p className="text-gray-700 mb-4">
          Contract Assistant is designed to help any party involved in a UK building contract, whether a Client, Main Contractor or Sub-contractor, explore specific issues, including general queries regarding relevant clauses, disputes or general concerns.
        </p>
        
        <p className="text-gray-700 mb-4">
          Simply input your query and Contract Assistant will return an appropriate response or provide an indication of what recourse might be available within the Contract to resolve the issues described.
        </p>
        
        <p className="text-gray-700 mb-4 font-semibold">
          Please be aware that the information and responses provided within this app are for informational and educational purposes only. They are not intended to constitute, nor should they be considered as, legal or contractual advice.
        </p>
        
        <p className="text-gray-700 mb-4">
          We strongly recommend that you consult with a qualified Legal Professional before making any decisions or taking any legal actions based on the content in this app. Our resources are designed to guide and inform, but your actual contractual situation may require specialist professional contractual / legal advice tailored to your specific needs.
        </p>
        
        <p className="text-gray-700 font-bold">
          If you wish to continue, please confirm below that you understand that the Contract Assistant app does not provide contractual or legal advice and is intended for information and education purposes only.
        </p>
      </div>
      
      <div className="text-center mb-6">
        <p className="text-lg font-medium text-gray-700 mb-4">
          Do you understand and consent to these terms?
        </p>
        
        <div className="flex justify-center gap-4">
          <Button
            onClick={handleAccept}
            className="bg-green-600 hover:bg-green-700"
          >
            Yes, I Understand and Consent
          </Button>
          
          <Button 
            onClick={handleDecline}
            className="bg-red-600 hover:bg-red-700"
          >
            No, I Do Not Consent
          </Button>
        </div>
      </div>
      
      <div id="exitMessage" className="hidden mt-8 p-4 bg-red-50 border border-red-200 rounded-lg text-center">
        <p className="text-red-800 font-medium">
          We understand your decision. You cannot proceed with using Contract Assistant without accepting the terms.
        </p>
        <p className="text-red-800 mt-2">
          Thank you for your interest in our application.
        </p>
      </div>
    </div>
  );
}