import { PromiseOrType } from '@decipad/utils';
import type { ResultMetadataColumn } from '../Result';
import type { ColumnLikeValue } from './ColumnLike';
import type { Value } from './Value';

export interface TableValue extends Value {
  columns: ColumnLikeValue[];
  columnNames: string[];
  tableRowCount(): Promise<number | undefined>;
  getColumn(name: string): ColumnLikeValue;
  mapColumns(
    mapFn: (
      col: ColumnLikeValue,
      index: number
    ) => PromiseOrType<ColumnLikeValue>
  ): Promise<TableValue>;
  meta: undefined | (() => undefined | ResultMetadataColumn);
}
