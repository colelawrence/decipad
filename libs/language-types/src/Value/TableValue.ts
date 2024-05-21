import type { Value } from '@decipad/language-interfaces';

export interface TableValue extends Value.Value {
  columns: Value.ColumnLikeValue[];
  columnNames: string[];
  tableRowCount(): Promise<number | undefined>;
  getColumn(name: string): Value.ColumnLikeValue;
}
