import { isFlagEnabled } from '@decipad/feature-flags';
import { useSession } from 'next-auth/react';
import { useUserQuery } from '@decipad/graphql-client';

export const useRequiresOnboarding = () => {
  const session = useSession();
  const [userResult] = useUserQuery();
  return (
    isFlagEnabled('ONBOARDING_ACCOUNT_SETUP') &&
    session.status === 'authenticated' &&
    userResult.data &&
    !userResult.data.self?.onboarded
  );
};
