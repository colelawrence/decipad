import { useSession } from 'next-auth/react';
import { useUserQuery } from '../graphql';

export const useRequiresOnboarding = () => {
  const session = useSession();
  const [userResult] = useUserQuery();
  return (
    session.status === 'authenticated' &&
    userResult.data &&
    !userResult.data.self?.onboarded
  );
};
