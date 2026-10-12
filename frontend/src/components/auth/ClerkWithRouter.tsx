import { useEffect, useRef, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { ClerkProvider, useAuth } from '@clerk/react';
import { useApolloClient } from '@apollo/client';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY as string;

/** ClerkProvider wired to React Router, so Clerk's redirects stay inside the SPA. */
export function ClerkWithRouter({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <ClerkProvider
      publishableKey={publishableKey}
      routerPush={(to) => navigate(to)}
      routerReplace={(to) => navigate(to, { replace: true })}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/"
      signUpFallbackRedirectUrl="/"
      afterSignOutUrl="/sign-in"
    >
      <ClearCacheOnUserChange />
      {children}
    </ClerkProvider>
  );
}

/** Drops the previous user's cached data when someone signs out or switches account. */
function ClearCacheOnUserChange() {
  const { isLoaded, userId } = useAuth();
  const client = useApolloClient();
  const previousUserId = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    if (!isLoaded) return;
    if (previousUserId.current !== undefined && previousUserId.current !== userId) {
      client.clearStore();
    }
    previousUserId.current = userId;
  }, [isLoaded, userId, client]);

  return null;
}
