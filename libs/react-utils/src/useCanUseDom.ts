/* eslint-disable no-underscore-dangle */
import { useMemo } from 'react';

type GlobalWithSSR = typeof global & {
  __DECI_IS_SSR__?: boolean;
};

export const useCanUseDom = () => {
  return useMemo(() => !(global as GlobalWithSSR).__DECI_IS_SSR__, []);
};
