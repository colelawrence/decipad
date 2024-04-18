import type { Type } from '../Type';
import { Table, isTableValue } from './Table';
import type { ColumnLikeValue } from './ColumnLike';
import type { Value } from './Value';
import zip from 'lodash.zip';
import unzip from 'lodash.unzip';
import { produce } from '@decipad/utils';
import type { TableValue } from './TableValue';

const sortTableByType = (table: TableValue, type: Type): Table => {
  const sorted = zip(table.columnNames, table.columns).sort(
    ([name1], [name2]) =>
      (type.columnNames?.indexOf(name1 as string) ?? 0) -
      (type.columnNames?.indexOf(name2 as string) ?? 0)
  );
  const [columnNames, columnValues] = unzip(sorted);
  return Table.fromNamedColumns(
    columnValues as ColumnLikeValue[],
    columnNames as string[]
  );
};

export const sortValue = <V extends Value>(type: Type, value: V): [Type, V] => {
  // Checking that declaration is a table
  const { columnNames, columnTypes } = type;
  if (
    !columnNames ||
    columnNames.length === 0 ||
    !columnTypes ||
    columnTypes.length === 0 ||
    !isTableValue(value)
  ) {
    return [type, value];
  }

  const tableValue = sortTableByType(value, type);

  const namesAndTypes: Array<
    [string | undefined, Type | undefined, ColumnLikeValue | undefined]
  > = zip(columnNames, columnTypes).map(([name, type]) => {
    const index = name != null ? tableValue.columnNames.indexOf(name) : -1;
    return [name, type, tableValue.columns[index]];
  });

  const sorted: Array<
    [string | undefined, Type | undefined, ColumnLikeValue | undefined]
  > = namesAndTypes.sort(
    ([, type1], [, type2]) =>
      (type1?.atParentIndex ?? 0) - (type2?.atParentIndex ?? 0)
  );

  const [newColumnNames, newColumnTypes, columns] = unzip(sorted);

  const columnType = produce(type, (t) => {
    t.columnNames = newColumnNames as string[];
    t.columnTypes = newColumnTypes as Type[];
  });

  return [
    columnType,
    Table.fromNamedColumns(
      columns as ColumnLikeValue[],
      newColumnNames as string[]
    ) as unknown as V,
  ];
};
