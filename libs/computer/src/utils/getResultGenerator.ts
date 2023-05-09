import { ResultGenerator } from 'libs/language/src/interpreter/interpreter-types';
import { OneResult } from 'libs/language/src/result';
import { from, slice } from '@decipad/generator-utils';
import { isResultGenerator } from './isResultGenerator';

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
