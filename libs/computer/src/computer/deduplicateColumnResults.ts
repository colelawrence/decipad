import { ColumnDesc } from '../types';

export const deduplicateColumnResults = (
  acc: ColumnDesc[],
  column: ColumnDesc
): ColumnDesc[] => {
  // find duplicate
  const existsPos = acc.findIndex(
    (existingCol) =>
      existingCol.tableName === column.tableName &&
      existingCol.columnName === column.columnName
  );
  if (existsPos >= 0) {
    const existsColumn = acc[existsPos];
    if (!existsColumn.blockId && column.blockId) {
      acc.splice(existsPos, 1);
      acc.push(column);
    } else {
      // do nothing, as the existing block has more information
    }
  } else {
    // no matching column, just add it
    acc.push(column);
  }
  return acc;
};
