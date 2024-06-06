import { from, slice } from '@decipad/generator-utils';
import { isResultGenerator } from './isResultGenerator';
import type { Result } from '@decipad/language-interfaces';

export const getResultGenerator = (
  v: Result.OneResult
): Result.ResultGenerator => {
  if (!isResultGenerator(v)) {
    if (Array.isArray(v)) {
      return (start = 0, end = Infinity) => slice(from(v), start, end);
    } else {
      console.error(v);
      throw new Error(`Expected result generator or array and got ${typeof v}`);
    }
  }
  return v;
};
