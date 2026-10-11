import React from 'react';
import { Navigate } from 'react-router-dom';

// In MOCK_MODE there is no Clerk: the user is always signed in, and the mocked
// backend treats every request as the seeded "Mock User".

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const ClerkProvider: React.FC<any> = ({ children }) => {
  return <>{children}</>;
};

export const useAuth = () => ({ isLoaded: true, isSignedIn: true, userId: 'mock-user' });

export const getToken = async (): Promise<string | null> => null;

export const Show: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};

export const RedirectToSignIn: React.FC = () => null;

// Nobody needs to sign in, so the sign-in pages just go to the app.
export const SignIn: React.FC<unknown> = () => <Navigate to="/" replace />;
export const SignUp: React.FC<unknown> = () => <Navigate to="/" replace />;

export const UserButton: React.FC = () => {
  return (
    <div
      title="Mock User"
      style={{ width: 28, height: 28, borderRadius: '9999px', backgroundColor: '#cbd5e1' }}
    />
  );
};

export const SignOutButton: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <>{children}</>;
};
