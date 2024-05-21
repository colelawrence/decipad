import { map } from '@decipad/generator-utils';
import type { Result, Value } from '@decipad/language-interfaces';
import { valueToResultValue } from './valueToResultValue';

export const columnValueToResultValue =
  (column: Value.ColumnLikeValue): Result.ResultColumn =>
  (start?: number, end?: number) =>
    map(column.values(start, end), valueToResultValue);
