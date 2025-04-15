import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white py-4 mt-auto">
      <div className="container mx-auto px-4 text-center text-sm">
        <p>Contract Assistant &copy; {new Date().getFullYear()}</p>
        <p className="mt-1 text-gray-400 text-xs">
          For information and educational purposes only. Not a substitute for professional legal advice.
        </p>
      </div>
    </footer>
  );
}