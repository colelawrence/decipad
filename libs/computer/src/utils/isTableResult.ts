// eslint-disable-next-line no-restricted-imports
import { Result } from '@decipad/language';
import { isTable } from './isTable';

export const isTableResult = (
  result: Result.AnyResult | undefined
): result is Result.Result<'table' | 'materialized-table'> =>
  result != null && isTable(result.type);
