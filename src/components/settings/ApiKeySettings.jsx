import React, { useState } from 'react';
import { useAppContext } from '../../contexts/AppContext';
import Button from '../common/Button';

export default function ApiKeySettings() {
  const { openaiApiKey, setOpenaiApiKey } = useAppContext();
  const [apiKey, setApiKey] = useState(openaiApiKey || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setOpenaiApiKey(apiKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">API Key Settings</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-3">
          Contract Assistant uses OpenAI's GPT-4o model to generate reports and draft letters. 
          Enter your OpenAI API key below to use the app.
        </p>
        <p className="text-gray-600 mb-3">
          If you don't have an OpenAI API key, you can get one from 
          <a 
            href="https://platform.openai.com/api-keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 ml-1"
          >
            OpenAI's platform
          </a>.
        </p>
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded text-yellow-800 text-sm mt-2">
          <strong>Important:</strong> Your API key is stored securely in your browser and is only used to make requests to OpenAI. 
          Your key is never stored on our servers.
        </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-1">
            OpenAI API Key
          </label>
          <div className="relative">
            <input
              id="apiKey"
              type={showApiKey ? "text" : "password"}
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="sk-..."
              className="box-border w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="button"
              onClick={toggleApiKeyVisibility}
              className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer text-gray-400 hover:text-gray-600"
            >
              {showApiKey ? "Hide" : "Show"}
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Button type="submit" disabled={!apiKey}>
            Save API Key
          </Button>
          
          {saveSuccess && (
            <span className="text-green-600 ml-3">
              API key saved successfully!
            </span>
          )}
        </div>
      </form>
    </div>
  );
}