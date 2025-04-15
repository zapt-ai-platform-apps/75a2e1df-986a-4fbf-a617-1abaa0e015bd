import React from 'react';

export default function ZaptBadge() {
  return (
    <div className="fixed bottom-4 left-4 z-50">
      <a 
        href="https://www.zapt.ai" 
        target="_blank" 
        rel="noopener noreferrer"
        className="inline-block rounded-md bg-gray-900 text-white text-xs px-3 py-1.5 shadow-md hover:bg-gray-800 transition-colors"
      >
        Made on ZAPT
      </a>
    </div>
  );
}