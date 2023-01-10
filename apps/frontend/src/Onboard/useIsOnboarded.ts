import { useSession } from 'next-auth/react';
import { useUserQuery } from '../graphql';

export const useIsOnboarded = () => {
  const session = useSession();
  const [userResult] = useUserQuery();
  return session.status === 'authenticated' && userResult.data?.self?.onboarded;
};
