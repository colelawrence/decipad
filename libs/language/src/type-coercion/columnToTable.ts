import { getDefined } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import {
  Dimension,
  RuntimeError,
  Type,
  Value,
  buildType as t,
} from '@decipad/language-types';
import { Realm } from '../interpreter';

const getColumnDimensionTypes = (
  realm: Realm,
  columnType: Type
): Array<[string, Type]> => {
  const { indexedBy } = columnType;
  if (!indexedBy) {
    return [];
  }
  const indexName = Dimension.resolveIndexDelegation(realm.utils, indexedBy);
  const tableType = realm.inferContext.stack.get(indexName);
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
): Array<[string, Value.ColumnLikeValue]> => {
  const { indexedBy } = columnType;
  if (!indexedBy) {
    return [];
  }
  const indexName = Dimension.resolveIndexDelegation(realm.utils, indexedBy);
  const tableType = realm.inferContext.stack.get(indexName);
  const table = realm.stack.get(indexName);
  if (!tableType || !table) {
    return [];
  }
  const [, sortedTable] = Value.sortValue(tableType, table);
  if (!Value.isTableValue(sortedTable)) {
    return [];
  }
  return [[sortedTable.columnNames[0], sortedTable.columns[0]]];
};

const columnToTableType = (realm: Realm, source: Type): Type => {
  const dimensions = getColumnDimensionTypes(realm, source);
  const columnNames = dimensions.map(([name]) => name);
  let columnName = 'Value';
  while (columnNames.includes(columnName)) {
    columnName = `_${columnName}`;
  }
  const allColumnNames = [...columnNames, columnName];
  return t.table({
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
  sourceValue: Value.Value
): Value.Table => {
  if (!Value.isColumnLike(sourceValue)) {
    throw new RuntimeError('Expected column');
  }
  const dimensions = getColumnDimensions(realm, sourceType);
  const columnNames = dimensions.map(([name]) => name);
  let columnName = 'Value';
  while (columnNames.includes(columnName)) {
    columnName = `_${columnName}`;
  }

  return Value.Table.fromNamedColumns(
    dimensions.map(([, value]) => value).concat(sourceValue),
    dimensions.map(([name]) => name).concat(columnName)
  );
};

export const columnToTable = {
  type: columnToTableType,
  value: columnToTableValue,
};
