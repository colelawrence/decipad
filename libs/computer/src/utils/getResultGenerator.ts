import { from, slice } from '@decipad/generator-utils';
// eslint-disable-next-line no-restricted-imports
import { type Result } from '@decipad/language';
import { isResultGenerator } from './isResultGenerator';

export const getResultGenerator = (
  v: Result.OneResult
): Result.ResultGenerator => {
  if (!isResultGenerator(v)) {
    if (Array.isArray(v)) {
      return (start = 0, end = Infinity) => slice(from(v), start, end);
    } else {
      throw new Error('Expected result generator or array');
    }
  }
  return v;
};
