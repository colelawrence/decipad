import type { Result } from '@decipad/language-interfaces';

export const isResultGenerator = (
  v: Result.OneResult | null
): v is Result.ResultGenerator => typeof v === 'function';
