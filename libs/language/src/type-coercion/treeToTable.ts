import { getDefined, produce } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { RuntimeError, Value, buildType as t } from '@decipad/language-types';
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
    columnTypes,
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

const shouldExpand = (col: Value.Tree | undefined): boolean => {
  const columns = col?.columns.slice(1);
  return (
    columns != null &&
    columns.length > 0 &&
    columns.every((column) => column.aggregation == null)
  );
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
    // eslint-disable-next-line no-await-in-loop
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
  if (firstNextColumn && shouldExpand(sourceValue)) {
    while (firstNextColumn.length > thisColumn.length) {
      thisColumn.push(rootValue);
    }
  }

  return [thisColumn, ...nextColumns];
};

const treeToTableValue = async (
  _realm: TRealm,
  sourceType: Type,
  sourceValue: ValueTypes.Value
): Promise<Value.Table> => {
  if (!Value.isTreeValue(sourceValue)) {
    throw new RuntimeError('Expected tree value');
  }

  // we have to remove the first column because it's the root, which only has Unknown values
  const columns = (
    await treeToColumnsValue(
      sourceType,
      sourceValue,
      sourceValue.columns[0]?.aggregation
    )
  ).slice(1);
  return Value.Table.fromNamedColumns(
    columns.map((col) =>
      Value.Column.fromValues(
        col.map((cell) => Value.fromJS(cell as Value.FromJSArg))
      )
    ),
    fixColumnNames(getDefined(sourceType.columnNames))
  );
};

export const treeToTable = {
  type: treeToTableType,
  value: treeToTableValue,
};
