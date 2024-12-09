import { getDefined, produce } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import {
  RuntimeError,
  Value,
  resultToValue,
  serializeType,
  buildType as t,
  uniqueConsecutiveRows,
} from '@decipad/language-types';
import type {
  Result,
  Type,
  Value as ValueTypes,
} from '@decipad/language-interfaces';
import type { TRealm } from '../scopedRealm';

const treeToTableType = (_realm: TRealm, source: Type): Type => {
  const columnTypes = getDefined(source.tree);
  const columnNames = fixColumnNames(getDefined(source.columnNames));
  return t.table({
    indexName: columnNames[0],
    columnNames,
    rowCount: undefined,
    columnTypes: columnTypes.map(
      produce((col) => {
        col.cellCount = undefined;
        return col;
      })
    ),
  });
};

const blindlyFixColumnName = (name: string): string => {
  const match = name.match(/.*(_[0-9]+)$/);
  if (match && match[1]) {
    return name.slice(0, name.indexOf(match[1]));
  }
  return name;
};

const fixColumnNames = (columnNames: string[]): string[] => {
  const existingColumnNames = new Set<string>();
  return columnNames.map((name) => {
    const firstProposal = blindlyFixColumnName(name);
    let tryProposal = firstProposal;
    let iteration = 0;
    while (existingColumnNames.has(tryProposal)) {
      iteration += 1;
      tryProposal = `${firstProposal}_${iteration}`;
    }
    existingColumnNames.add(tryProposal);
    return tryProposal;
  });
};

const concatenateColumns = (
  col1: Result.OneResult[] | undefined,
  col2: Result.OneResult[] | undefined
): Result.OneResult[] => {
  if (!col1 && !col2) {
    return [];
  }
  if (!col1) {
    return getDefined(col2);
  }
  if (!col2) {
    return col1;
  }
  return col1.concat(col2);
};

const concatenateColumnsArray = (
  cols1: Result.OneResult[][],
  cols2: Result.OneResult[][]
): Result.OneResult[][] => {
  const maxIndex = Math.max(cols1.length, cols2.length);
  const cols: Result.OneResult[][] = [];
  for (let colIndex = 0; colIndex < maxIndex; colIndex++) {
    const resultingCol = concatenateColumns(cols1[colIndex], cols2[colIndex]);
    cols.push(resultingCol);
  }
  return cols;
};

const treeToColumnsValue = async (
  sourceType: Type,
  sourceValue: Value.Tree,
  rootAggregation?: Result.Result
): Promise<Result.OneResult[][]> => {
  const thisColumn: Result.OneResult[] = [];
  let nextColumns: Result.OneResult[][] = [];
  for (const child of sourceValue.children) {
    const nextColumnsType = produce(sourceType, (sourceType) => {
      sourceType.tree = getDefined(sourceType.tree).slice(1);
      sourceType.columnNames = getDefined(sourceType.columnNames).slice(1);
    });
    nextColumns = concatenateColumnsArray(
      nextColumns,
      // eslint-disable-next-line no-await-in-loop
      await treeToColumnsValue(
        nextColumnsType,
        child,
        sourceValue.columns[0]?.aggregation
      )
    );
  }
  const rootValue = rootAggregation?.value ?? sourceValue.root;
  const firstNextColumn = nextColumns[0];
  thisColumn.push(rootValue);
  if (firstNextColumn) {
    while (firstNextColumn.length > thisColumn.length) {
      thisColumn.push(rootValue);
    }
  }

  return [thisColumn, ...nextColumns];
};

const emptyMeta = undefined;

const treeToTableValue = async (
  _realm: TRealm,
  sourceType: Type,
  sourceValue: ValueTypes.Value
): Promise<Value.Table> => {
  if (!Value.isTreeValue(sourceValue)) {
    throw new RuntimeError('Expected tree value');
  }

  // we have to remove the first column because it's the root, which only has Unknown values
  const columns = uniqueConsecutiveRows(
    await treeToColumnsValue(
      sourceType,
      sourceValue,
      sourceValue.columns[0]?.aggregation
    )
  ).slice(1);
  const tableType = treeToTableType(_realm, sourceType);
  const columnTypes = getDefined(tableType.columnTypes);
  return Value.Table.fromNamedColumns(
    columns.map((col, colIndex) => {
      const columnType = serializeType(columnTypes[colIndex]);
      return Value.Column.fromValues(
        col.map((cell) =>
          resultToValue({ type: columnType, value: cell, meta: undefined })
        ),
        emptyMeta
      );
    }),
    fixColumnNames(getDefined(sourceType.columnNames)),
    emptyMeta
  );
};

export const treeToTable = {
  type: treeToTableType,
  value: treeToTableValue,
};
