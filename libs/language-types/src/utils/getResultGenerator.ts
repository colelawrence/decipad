import { from, slice } from '@decipad/generator-utils';
// eslint-disable-next-line no-restricted-imports
import { isResultGenerator } from './isResultGenerator';
import type { OneResult, ResultGenerator } from '../Result';

export const getResultGenerator = (v: OneResult): ResultGenerator => {
  if (!isResultGenerator(v)) {
    if (Array.isArray(v)) {
      return (start = 0, end = Infinity) => slice(from(v), start, end);
    } else {
      throw new Error('Expected result generator or array');
    }
  }
  return v;
};
