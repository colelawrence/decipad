import { isServerSideRendering } from '@decipad/support';
import { useSession } from 'next-auth/react';
import { useUserQuery } from '@decipad/graphql-client';

export const useRequiresOnboarding = () => {
  const session = useSession();
  const [userResult] = useUserQuery();
  return (
    !isServerSideRendering() &&
    session.status === 'authenticated' &&
    userResult.data != null &&
    userResult.data.self != null &&
    !userResult.data.self.onboarded
  );
};
