import { useEffect } from 'react';
import { DefaultSession } from 'next-auth';
import { useUpdateUserMutation } from '@decipad/graphql-client';
import { useSession } from 'next-auth/react';

interface CustomerUser extends DefaultSession {
  onboarded?: boolean | null;
}

export const useFinishOnboarding = () => {
  const session = useSession();
  const [, updateUser] = useUpdateUserMutation();

  const user = session.data?.user as CustomerUser | undefined;
  const needsOnboarding = user && user?.onboarded === false;

  useEffect(() => {
    if (!needsOnboarding) return;

    updateUser({ props: { onboarded: true } });
  }, [needsOnboarding, updateUser]);
};
