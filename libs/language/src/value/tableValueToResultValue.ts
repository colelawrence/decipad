// eslint-disable-next-line no-restricted-imports
import type { Result, Value } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { columnValueToResultValue } from '@decipad/language-types';

export const tableValueToTableResultValue = (
  v: Value.TableValue
): Result.ResultTable => v.columns.map(columnValueToResultValue);
