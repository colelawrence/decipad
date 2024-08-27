import type { Type } from '../Type';
import { getTableValue, isTableValue, Table } from './Table';
import zip from 'lodash.zip';
import unzip from 'lodash.unzip';
import { produce } from '@decipad/utils';
import { type TableValue } from './TableValue';
import type { Result, Value } from '@decipad/language-interfaces';
import { all, map } from '@decipad/generator-utils';
import { getResultGenerator } from '../utils/getResultGenerator';
import { stringifyDate } from '../Time/stringifyDate';

const sortTableByType = (table: TableValue, type: Type): TableValue => {
  const sorted = zip(table.columnNames, table.columns).sort(
    ([name1], [name2]) =>
      (type.columnNames?.indexOf(name1 as string) ?? 0) -
      (type.columnNames?.indexOf(name2 as string) ?? 0)
  );
  const [columnNames, columnValues] = unzip(sorted);
  return Table.fromNamedColumns(
    columnValues as Value.ColumnLikeValue[],
    columnNames as string[],
    columnValues?.[0]
      ? (columnValues[0] as undefined | Value.ColumnLikeValue)?.meta?.bind(
          columnValues[0]
        )
      : undefined
  );
};

const sortNamesAndTypes = (namesAndTypes: NamesAndTypes): NamesAndTypes =>
  namesAndTypes.sort(
    ([, type1], [, type2]) =>
      (type1?.atParentIndex ?? 0) - (type2?.atParentIndex ?? 0)
  );

type NamesAndTypes = Array<
  [string | undefined, Type | undefined, Value.ColumnLikeValue | undefined]
>;

const columnWithMeta = (
  columnType: Type,
  column: Value.ColumnLikeValue,
  columnIndex: number
): Value.ColumnLikeValue => {
  if (!column) {
    return column;
  }
  if (columnIndex > 0) {
    return column;
  }
  if (column?.meta) {
    return column;
  }
  const replacingMeta = () => {
    const originalMeta: Result.ResultMetadata | undefined =
      column.meta !== replacingMeta ? column.meta?.() : undefined;
    if (originalMeta?.labels) {
      return originalMeta;
    }

    return {
      labels: Promise.all([
        column.getData().then(async (data) =>
          all(
            map(getResultGenerator(data)(), (v) => {
              if (columnType.date) {
                return v
                  ? stringifyDate(
                      v as bigint | number | symbol | undefined,
                      columnType.date
                    )
                  : '';
              }
              return v?.toString() ?? '';
            })
          )
        ),
      ]),
    };
  };
  column.meta = replacingMeta;
  return column;
};

export const sortValue = <V extends Value.Value>(
  type: Type,
  value: V
): [Type, V] => {
  // Checking that declaration is a table
  const { columnNames, columnTypes } = type;
  if (
    !isTableValue(value) ||
    !columnNames ||
    columnNames.length === 0 ||
    !columnTypes ||
    columnTypes.length === 0
  ) {
    return [type, value];
  }

  const a = getTableValue(value);
  const tableValue = sortTableByType(a, type);

  const namesAndTypes: NamesAndTypes = zip(columnNames, columnTypes).map(
    ([name, type]) => {
      const index = name != null ? tableValue.columnNames.indexOf(name) : -1;
      return [name, type, tableValue.columns[index]];
    }
  );

  const [newColumnNames, newColumnTypes, columns] = unzip(
    sortNamesAndTypes(namesAndTypes)
  ) as [Array<string>, Array<Type>, Array<Value.ColumnLikeValue>];

  const columnsWithMeta = columns.map((column, columnIndex) =>
    columnWithMeta(newColumnTypes[columnIndex], column, columnIndex)
  );

  const [firstColumn] = columnsWithMeta;
  for (const column of columnsWithMeta.slice(1)) {
    if (column && firstColumn?.meta && !column.meta) {
      column.meta = firstColumn.meta.bind(firstColumn);
    }
  }
  const columnType = produce(type, (t) => {
    t.columnNames = newColumnNames;
    t.columnTypes = newColumnTypes;
  });

  return [
    columnType,
    Table.fromNamedColumns(
      columnsWithMeta,
      newColumnNames,
      firstColumn?.meta?.bind(firstColumn)
    ) as unknown as V,
  ];
};
