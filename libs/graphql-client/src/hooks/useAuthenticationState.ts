import { signOut, useSession } from 'next-auth/react';
import { useCallback, useMemo } from 'react';
import { useUserQuery } from '@decipad/graphql-client';

export const useAuthenticationState = () => {
  const { data: session } = useSession();
  const { data: user } = useUserQuery()[0];

  const userName = user?.self?.name || 'Me';
  const userEmail = session?.user?.email || 'me@example.com';
  const userId = 'me'; // TODO: fix user id

  const signOutCallback = useCallback(() => {
    // Checklist show is stored in db, no longer needed on logout.
    // Because after any refresh it persists.

    signOut({ redirect: false }).then(() => {
      window.location.pathname = '/';
    });
  }, []);

  return useMemo(
    () => ({
      currentUser: {
        id: userId,
        name: userName,
        email: userEmail,
      },
      signOutCallback,
    }),
    [userId, userName, userEmail, signOutCallback]
  );
};
