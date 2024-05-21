// eslint-disable-next-line no-restricted-imports
import type { Value } from '@decipad/language-types';
import type { Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { columnValueToResultValue } from '@decipad/language-types';

export const tableValueToTableResultValue = (
  v: Value.TableValue
): Result.ResultTable => v.columns.map(columnValueToResultValue);
