import type { Result, Value } from '@decipad/language-interfaces';
import { PromiseOrType } from '@decipad/utils';

export interface TableValue extends Value.Value {
  columns: Value.ColumnLikeValue[];
  columnNames: string[];
  tableRowCount(): Promise<number | undefined>;
  getColumn(name: string): Value.ColumnLikeValue;
  meta: undefined | (() => Result.ResultMetadataColumn | undefined);
  mapColumns(
    mapFn: (
      col: Value.ColumnLikeValue,
      index: number
    ) => PromiseOrType<Value.ColumnLikeValue>
  ): Promise<TableValue>;
}
