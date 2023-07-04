import { isFlagEnabled } from '@decipad/feature-flags';
import { isServerSideRendering } from '@decipad/support';
import { useSession } from 'next-auth/react';
import { useUserQuery } from '@decipad/graphql-client';

export const useRequiresOnboarding = () => {
  const session = useSession();
  const [userResult] = useUserQuery();
  return (
    isFlagEnabled('ONBOARDING_ACCOUNT_SETUP') &&
    !isServerSideRendering() &&
    session.status === 'authenticated' &&
    userResult.data != null &&
    userResult.data.self != null &&
    !userResult.data.self.onboarded
  );
};
