import React from 'react';

export default function ApiKeySettings() {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">API Key Information</h2>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-3">
          Contract Assistant uses OpenAI's GPT-4o model to generate reports and draft letters.
          The API key is managed by the application administrator.
        </p>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded text-blue-800 text-sm mt-2">
          <strong>Note:</strong> You don't need to provide your own API key. The application is configured to use a shared API key.
        </div>
      </div>
    </div>
  );
}