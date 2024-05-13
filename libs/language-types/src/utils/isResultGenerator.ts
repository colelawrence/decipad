import type { OneResult, ResultGenerator } from '../Result';

export const isResultGenerator = (v: OneResult): v is ResultGenerator =>
  typeof v === 'function';
