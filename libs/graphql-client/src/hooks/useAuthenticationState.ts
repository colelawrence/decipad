import { signOut, useSession } from 'next-auth/react';
import { DefaultSession } from 'next-auth';
import { useCallback, useMemo } from 'react';

/* we need to override the Session object from useSession()
 * as we decorated it with additional fields in server side
 */
interface CustomUser extends DefaultSession {
  user?: {
    name: string;
    email: string;
    image: string;
    description?: string;
    id: string;
    username?: string;
    onboarded?: boolean | null;
  };
}

export const useAuthenticationState = () => {
  const { data: session } = useSession();
  const userSession = session as CustomUser | undefined;

  const userName = userSession?.user?.name || 'Me';
  const userEmail = userSession?.user?.email || 'me@example.com';
  const userUsername = userSession?.user?.username || '';
  const userBio = userSession?.user?.description || '';
  const userId = userSession?.user?.id || 'me';
  const userImage = userSession?.user?.image;
  const userOnboarded = userSession?.user?.onboarded;

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
        username: userUsername,
        email: userEmail,
        bio: userBio,
        image: userImage,
        onboarded: userOnboarded,
      },
      signOutCallback,
    }),
    [
      userId,
      userName,
      userUsername,
      userEmail,
      userBio,
      userImage,
      userOnboarded,
      signOutCallback,
    ]
  );
};
