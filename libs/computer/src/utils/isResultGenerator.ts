// eslint-disable-next-line no-restricted-imports
import { Result } from '@decipad/language';

export const isResultGenerator = (
  v: Result.OneResult
): v is Result.ResultGenerator => typeof v === 'function';
