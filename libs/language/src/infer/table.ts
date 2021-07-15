import { AST } from '..';
import { Type } from '../type';
import { zip, getDefined } from '../utils';

export const findBadColumn = (table: Type) =>
  [...getDefined(table.tupleTypes, 'expected tuple')].find(
    (c) => c.errorCause != null
  );

export const getLargestColumn = (tupleTypes: Type[]) => {
  const columnSizes = new Set([...tupleTypes].map((c) => c.columnSize));
  columnSizes.delete(null);
  return [...columnSizes][0] ?? null;
};

export const unifyColumnSizes = (node: AST.Table, table: Type): Type => {
  if (table.tupleNames == null || table.tupleTypes == null) {
    throw new Error('panic: expected tuple with names');
  }

  const columnSize = getLargestColumn(table.tupleTypes);
  if (columnSize == null) {
    // Non-column tuple
    return table;
  }

  const tupleTypes = [];
  const tupleNames = [];

  for (const [colName, colValue] of zip(table.tupleNames, table.tupleTypes)) {
    const newValue = colValue.columnSize
      ? // Ensure it's the same size
        colValue.withColumnSize(columnSize)
      : // Create a new type with that size
        Type.buildColumn(colValue as Type, columnSize);

    tupleTypes.push(newValue);
    tupleNames.push(colName);
  }

  const unifiedTable = Type.buildTuple(tupleTypes, tupleNames);

  if (findBadColumn(unifiedTable) != null) {
    return Type.Impossible.inNode(node).withErrorCause(
      'Incompatible column sizes'
    );
  } else {
    return unifiedTable;
  }
};
