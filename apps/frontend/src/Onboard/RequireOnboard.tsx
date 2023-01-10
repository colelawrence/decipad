import { isFlagEnabled } from '@decipad/feature-flags';
import { onboard } from '@decipad/routing';
import { FC, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useRequiresOnboarding } from './useRequiresOnboarding';

interface RequireOnboardProps {
  readonly children: ReactNode;
}

export const RequireOnboard: FC<RequireOnboardProps> = ({ children }) => {
  const requiresOnboarding = useRequiresOnboarding();

  return requiresOnboarding && isFlagEnabled('ONBOARDING_ACCOUNT_SETUP') ? (
    <Navigate replace to={onboard({}).$} />
  ) : (
    <>{children}</>
  );
};
