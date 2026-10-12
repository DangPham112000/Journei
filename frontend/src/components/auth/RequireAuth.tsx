import type { ReactNode } from 'react';
import { RedirectToSignIn, Show } from '@clerk/react';

/** Shows children to signed-in users and sends everyone else to /sign-in. */
export function RequireAuth({ children }: { children: ReactNode }) {
  return (
    <Show when="signed-in" fallback={<RedirectToSignIn />}>
      {children}
    </Show>
  );
}
