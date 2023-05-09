import { ColumnLikeValue, ValueGeneratorFunction } from './types';

export const columnValueToValueGeneratorFunction =
  (column: ColumnLikeValue): ValueGeneratorFunction =>
  (start?: number, end?: number) =>
    column.values(start, end);
