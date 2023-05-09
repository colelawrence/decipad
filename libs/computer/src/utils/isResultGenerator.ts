import { ResultGenerator } from 'libs/language/src/interpreter/interpreter-types';
import { OneResult } from 'libs/language/src/result';

export const isResultGenerator = (v: OneResult): v is ResultGenerator =>
  typeof v === 'function';
