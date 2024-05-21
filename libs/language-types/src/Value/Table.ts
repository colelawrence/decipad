import { isColumnLike } from './ColumnLike';
import { EmptyColumn } from './EmptyColumn';
import type { AnyMapping } from '@decipad/utils';
import {
  anyMappingToMap,
  filterUnzipped,
  getInstanceof,
  unzip,
} from '@decipad/utils';
import type { Result, Value } from '@decipad/language-interfaces';
import { RuntimeError } from '../RuntimeError';
import type { TableValue } from './TableValue';
import { GeneratorTable } from './GeneratorTable';

export class Table implements TableValue {
  columns: Value.ColumnLikeValue[];
  columnNames: string[];

  constructor(columns: Value.ColumnLikeValue[], columnNames: string[]) {
    this.columns = columns;
    this.columnNames = columnNames;
  }

  static fromNamedColumns(
    columns: Value.Value[] = [],
    columnNames: string[] = []
  ) {
    return new Table(
      columns.map((c) => (isColumnLike(c) ? c : new EmptyColumn([]))),
      columnNames
    );
  }

  static fromMapping(mapping: AnyMapping<Value.ColumnLikeValue>) {
    const [columnNames, columns] = unzip(anyMappingToMap(mapping).entries());
    return new Table(columns, columnNames);
  }

  async tableRowCount(): Promise<number | undefined> {
    return this.columns.at(0)?.rowCount();
  }

  getColumn(name: string) {
    const index = this.columnNames.indexOf(name);
    if (index < 0 || index >= this.columns.length) {
      throw new RuntimeError(`Missing column ${name}`);
    }
    return this.columns[index];
  }

  async getData(): Promise<Result.OneResult> {
    return Promise.all(this.columns.map(async (column) => column.getData()));
  }

  async mapColumns(
    mapFn: (
      col: Value.ColumnLikeValue,
      index: number
    ) => Promise<Value.ColumnLikeValue> | Value.ColumnLikeValue
  ): Promise<Table> {
    return Table.fromNamedColumns(
      await Promise.all(this.columns.map(mapFn)),
      this.columnNames
    );
  }

  filterColumns(
    fn: (colName: string, col: Value.ColumnLikeValue) => boolean
  ): Table {
    const [names, columns] = filterUnzipped(this.columnNames, this.columns, fn);

    return Table.fromNamedColumns(columns, names);
  }
}

export const isTableValue = (
  v: Value.Value | undefined | null
): v is Table | GeneratorTable =>
  (v instanceof Table || v instanceof GeneratorTable) &&
  v.columnNames != null &&
  v.columns != null;

export const getTableValue = (v: unknown): Table | GeneratorTable =>
  v instanceof Table
    ? getInstanceof(v, Table)
    : getInstanceof(v, GeneratorTable);
