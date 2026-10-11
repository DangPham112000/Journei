import { SignIn, SignUp } from '@clerk/react';

/** Full-screen Clerk sign-in / sign-up. */
export default function SignInPage({ mode = 'sign-in' }: { mode?: 'sign-in' | 'sign-up' }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      {mode === 'sign-in' ? (
        <SignIn routing="path" path="/sign-in" />
      ) : (
        <SignUp routing="path" path="/sign-up" />
      )}
    </div>
  );
}
