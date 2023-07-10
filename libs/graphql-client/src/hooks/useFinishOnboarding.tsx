import { useEffect } from 'react';
import { useUpdateUserMutation, useUserQuery } from '@decipad/graphql-client';

export const useFinishOnboarding = () => {
  const [userResult] = useUserQuery();
  const [, updateUser] = useUpdateUserMutation();

  const isLoading = userResult.fetching;
  const needsOnboarding = userResult.data?.self?.onboarded === false;

  useEffect(() => {
    if (isLoading) return;
    if (!needsOnboarding) return;

    updateUser({ props: { onboarded: true } });
  }, [isLoading, needsOnboarding, updateUser]);
};
