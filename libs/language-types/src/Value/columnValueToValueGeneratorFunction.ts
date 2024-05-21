import type { Value } from '@decipad/language-interfaces';
import type { ValueGeneratorFunction } from './ValueGenerator';

export const columnValueToValueGeneratorFunction =
  (column: Value.ColumnLikeValue): ValueGeneratorFunction =>
  (start?: number, end?: number) =>
    column.values(start, end);
