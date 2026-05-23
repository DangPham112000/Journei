import React from 'react';

export const GoogleOAuthProvider: React.FC<{ clientId: string; children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

// eslint-disable-next-line react-refresh/only-export-components, @typescript-eslint/no-explicit-any
export const useGoogleLogin = (options: any) => {
  return () => {
    console.log('[MOCK] Intercepted Google Login');
    if (options.onSuccess) {
      options.onSuccess({ code: 'mock-auth-code-123' });
    }
  };
};
