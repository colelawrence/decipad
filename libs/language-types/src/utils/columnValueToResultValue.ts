import { map } from '@decipad/generator-utils';
import { valueToResultValue } from './valueToResultValue';
import { ColumnLikeValue } from '../Value/ColumnLike';
import { ResultColumn } from '../Result';

export const columnValueToResultValue =
  (column: ColumnLikeValue): ResultColumn =>
  (start?: number, end?: number) =>
    map(column.values(start, end), valueToResultValue);
