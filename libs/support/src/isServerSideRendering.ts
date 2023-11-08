import { supports } from './supports';
/* eslint-disable no-underscore-dangle */
type GlobalWithSSR = typeof global & {
  __DECI_IS_SSR__?: boolean;
};

export const isServerSideRendering = (): boolean => {
  return !supports('document') || !!(global as GlobalWithSSR).__DECI_IS_SSR__;
};
