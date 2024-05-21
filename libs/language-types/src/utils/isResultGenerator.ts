import type { Result } from '@decipad/language-interfaces';

export const isResultGenerator = (
  v: Result.OneResult
): v is Result.ResultGenerator => typeof v === 'function';
