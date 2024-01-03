// eslint-disable-next-line no-restricted-imports
import {
  Result,
  Value,
  columnValueToResultValue,
} from '@decipad/language-types';

export const tableValueToTableResultValue = (
  v: Value.Table
): Result.ResultTable => v.columns.map(columnValueToResultValue);
