import { ColumnLikeValue } from './ColumnLike';
import { ValueGeneratorFunction } from './ValueGenerator';

export const columnValueToValueGeneratorFunction =
  (column: ColumnLikeValue): ValueGeneratorFunction =>
  (start?: number, end?: number) =>
    column.values(start, end);
