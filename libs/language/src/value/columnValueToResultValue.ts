import { map } from '@decipad/generator-utils';
import { ResultColumn } from '../interpreter/interpreter-types';
import { ColumnLikeValue } from './types';
import { valueToResultValue } from './valueToResultValue';

export const columnValueToResultValue =
  (column: ColumnLikeValue): ResultColumn =>
  (start?: number, end?: number) =>
    map(column.values(start, end), valueToResultValue);
