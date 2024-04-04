import { map } from '@decipad/generator-utils';
import { valueToResultValue } from './valueToResultValue';
import type { ColumnLikeValue } from '../Value/ColumnLike';
import type { ResultColumn } from '../Result';

export const columnValueToResultValue =
  (column: ColumnLikeValue): ResultColumn =>
  (start?: number, end?: number) =>
    map(column.values(start, end), valueToResultValue);
