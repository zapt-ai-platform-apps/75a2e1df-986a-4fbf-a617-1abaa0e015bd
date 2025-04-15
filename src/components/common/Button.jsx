import React from 'react';

export default function Button({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false,
  className = '',
  icon = null,
  size = 'md',
  variant = 'primary'
}) {
  // Define size classes
  const sizeClasses = {
    sm: 'px-2 py-1 text-sm',
    md: 'px-3 py-2',
    lg: 'px-4 py-2.5 text-lg'
  };
  
  // Define variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-600 hover:bg-yellow-700 text-white',
    info: 'bg-indigo-600 hover:bg-indigo-700 text-white',
    light: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    outline: 'bg-transparent border border-current hover:bg-gray-100 text-blue-600'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`cursor-pointer flex items-center justify-center rounded-md font-medium transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed ${sizeClasses[size]} ${className || variantClasses[variant]}`}
    >
      {icon && <span className={children ? 'mr-1.5' : ''}>{icon}</span>}
      {children}
    </button>
  );
}