import { produce } from 'immer';
import { InferError, Type, TableType } from '../type';

export const findBadColumn = (table: TableType) =>
  [...table.columnDefs.values()].find((c) => c.errorCause != null);

export const unifyColumnSizes = (
  statement: AST.TableDefinition,
  table: TableType
): TableType | Type => {
  const columnSizes = new Set(
    [...table.columnDefs.values()].map((c) => c.columnSize)
  );
  columnSizes.delete(null);

  const columnSize = [...columnSizes][0] ?? 1;

  const unifiedTable = produce(table, (table) => {
    for (const [colName, colValue] of table.columnDefs.entries()) {
      const newValue = colValue.columnSize
        ? // Ensure it's the same size
          colValue.isColumn(columnSize)
        : // Create a new type with that size
          Type.extend(colValue as Type, { columnSize: columnSize });

      table.columnDefs.set(colName, newValue);
    }
  });

  if (findBadColumn(unifiedTable) != null) {
    return Type.Impossible.inNode(statement).withErrorCause(
      new InferError('Incompatible column sizes')
    );
  } else {
    return unifiedTable;
  }
};
