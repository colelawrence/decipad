import { getDefined } from '@decipad/utils';
import { buildType } from '../type';
import { Type } from '../type/Type';
import {
  ColumnLikeValue,
  RuntimeError,
  Table,
  Value,
  isColumnLike,
  isTableValue,
} from '../value';
import { resolveIndexDelegation } from '../dimtools';
import { Realm, sortValue } from '../interpreter';
import { Context } from '../infer';

const getColumnDimensionTypes = (
  ctx: Context,
  columnType: Type
): Array<[string, Type]> => {
  const { indexedBy } = columnType;
  if (!indexedBy) {
    return [];
  }
  const indexName = resolveIndexDelegation(ctx, indexedBy);
  const tableType = ctx.stack.get(indexName);
  if (!tableType) {
    return [];
  }
  if (!tableType.columnTypes?.[0] || !tableType.columnNames?.[0]) {
    return [];
  }
  return [[tableType.columnNames[0], tableType.columnTypes[0]]];
};

const getColumnDimensions = (
  realm: Realm,
  columnType: Type
): Array<[string, ColumnLikeValue]> => {
  const { indexedBy } = columnType;
  if (!indexedBy) {
    return [];
  }
  const indexName = resolveIndexDelegation(realm.inferContext, indexedBy);
  const tableType = realm.inferContext.stack.get(indexName);
  const table = realm.stack.get(indexName);
  if (!tableType || !table) {
    return [];
  }
  const [, sortedTable] = sortValue(tableType, table);
  if (!isTableValue(sortedTable)) {
    return [];
  }
  return [[sortedTable.columnNames[0], sortedTable.columns[0]]];
};

const columnToTableType = (ctx: Context, source: Type): Type => {
  const dimensions = getColumnDimensionTypes(ctx, source);
  const columnNames = dimensions.map(([name]) => name);
  let columnName = 'Value';
  while (columnNames.includes(columnName)) {
    columnName = `_${columnName}`;
  }
  const allColumnNames = [...columnNames, columnName];
  return buildType.table({
    indexName: allColumnNames[0],
    columnNames: allColumnNames,
    columnTypes: dimensions
      .map(([, type]) => type)
      .concat(getDefined(source.cellType)),
  });
};

const columnToTableValue = (
  realm: Realm,
  sourceType: Type,
  sourceValue: Value
): Table => {
  if (!isColumnLike(sourceValue)) {
    throw new RuntimeError('Expected column');
  }
  const dimensions = getColumnDimensions(realm, sourceType);
  const columnNames = dimensions.map(([name]) => name);
  let columnName = 'Value';
  while (columnNames.includes(columnName)) {
    columnName = `_${columnName}`;
  }

  return Table.fromNamedColumns(
    dimensions.map(([, value]) => value).concat(sourceValue),
    dimensions.map(([name]) => name).concat(columnName)
  );
};

export const columnToTable = {
  type: columnToTableType,
  value: columnToTableValue,
};
