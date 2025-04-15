import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false,
  className = '',
  icon = null
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer flex items-center justify-center px-4 py-2 rounded-md text-white font-medium transition-all shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${className || 'bg-blue-600 hover:bg-blue-700'}`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
}