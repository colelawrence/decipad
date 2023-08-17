import { isServerSideRendering } from '@decipad/support';
import { User } from '@decipad/interfaces';
import { useSession } from 'next-auth/react';

export const useRequiresOnboarding = () => {
  const session = useSession();
  const user = session.data?.user as User | undefined;
  return (
    !isServerSideRendering() &&
    session.status === 'authenticated' &&
    user &&
    !user.onboarded
  );
};
