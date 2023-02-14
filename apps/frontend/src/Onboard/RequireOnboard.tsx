import { onboard } from '@decipad/routing';
import { FC, ReactNode, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { BehaviorSubject } from 'rxjs';
import { useRequiresOnboarding } from './useRequiresOnboarding';

interface RequireOnboardProps {
  readonly children: ReactNode;
}

export const PreOnboardingPath = new BehaviorSubject('/');

export const RequireOnboard: FC<RequireOnboardProps> = ({ children }) => {
  const requiresOnboarding = useRequiresOnboarding();
  const { pathname } = useLocation();

  useEffect(() => {
    PreOnboardingPath.next(pathname);
  }, [pathname]);

  return requiresOnboarding && !navigator.webdriver ? (
    <Navigate replace to={onboard({}).$} />
  ) : (
    <>{children}</>
  );
};
