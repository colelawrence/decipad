import { isRemoteComputerClient } from '@decipad/remote-computer';
import { dequal } from '@decipad/utils';
import mMemoize from 'micro-memoize';

const memoizeParams = {
  isEqual: (a: unknown, b: unknown) => {
    if (isRemoteComputerClient(a) && isRemoteComputerClient(b)) {
      return a === b;
    }
    return dequal(a, b);
  },
  maxSize: 10000,
};

export const memoize: typeof mMemoize = (fn, params) =>
  mMemoize(fn, { ...memoizeParams, ...params });
