import type { ColumnLikeValue } from './ColumnLike';
import type { Value } from './Value';

export interface TableValue extends Value {
  columns: ColumnLikeValue[];
  columnNames: string[];
  tableRowCount(): Promise<number | undefined>;
  getColumn(name: string): ColumnLikeValue;
}
