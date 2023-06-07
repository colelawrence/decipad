import { lazy } from 'react';

export const loadOnboarding = () =>
  import(/* webpackChunkName: "onboarding" */ './Onboard');
export const Onboard = lazy(loadOnboarding);
