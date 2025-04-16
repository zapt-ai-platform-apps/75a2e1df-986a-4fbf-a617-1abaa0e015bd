import React from 'react';
import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/supabaseClient';

export default function AuthForm() {
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <div className="text-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Sign in with ZAPT</h2>
        <p className="text-sm text-gray-600 mt-1">
          <a 
            href="https://www.zapt.ai" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Learn more about ZAPT
          </a>
        </p>
      </div>
      
      <Auth
        supabaseClient={supabase}
        appearance={{ 
          theme: ThemeSupa,
          variables: {
            default: {
              colors: {
                brand: '#1e40af',
                brandAccent: '#1e3a8a',
              },
            },
          },
        }}
        providers={['google', 'facebook', 'apple']}
        magicLink={true}
        view="magic_link"
      />
    </div>
  );
}