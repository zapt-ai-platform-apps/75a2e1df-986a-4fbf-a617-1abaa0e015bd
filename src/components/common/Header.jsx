import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../../contexts/AppContext';
import { FiSettings } from 'react-icons/fi';

export default function Header() {
  const { hasConsented } = useAppContext();
  
  return (
    <header className="bg-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <img 
            src="https://supabase.zapt.ai/storage/v1/render/image/public/icons/c7bd5333-787f-461f-ae9b-22acbc0ed4b0/55145115-0624-472f-96b9-d5d88aae355f.png?width=32&height=32" 
            alt="Contract Assistant Logo" 
            className="w-8 h-8 mr-3"
          />
          <h1 className="text-xl font-bold">Contract Assistant</h1>
        </div>
        
        {hasConsented && (
          <nav>
            <ul className="flex space-x-4 text-sm items-center">
              <li>
                <Link 
                  to="/project" 
                  className="text-white hover:text-blue-200 transition-colors py-1 px-2 rounded hover:bg-blue-700"
                >
                  Project Details
                </Link>
              </li>
              <li>
                <Link 
                  to="/report" 
                  className="text-white hover:text-blue-200 transition-colors py-1 px-2 rounded hover:bg-blue-700"
                >
                  Reports
                </Link>
              </li>
              <li>
                <Link 
                  to="/settings" 
                  className="text-white hover:text-blue-200 transition-colors py-1 px-2 rounded hover:bg-blue-700 flex items-center"
                >
                  <FiSettings className="mr-1" /> Settings
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </header>
  );
}