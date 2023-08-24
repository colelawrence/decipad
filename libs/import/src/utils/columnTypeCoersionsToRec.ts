import { TableCellType } from '@decipad/editor-types';

export const columnTypeCoercionsToRec = (
  columnTypeCoercions:
    | Array<TableCellType | undefined>
    | Record<number, TableCellType>
): Record<number, TableCellType> => {
  if (Array.isArray(columnTypeCoercions)) {
    const rec: Record<number, TableCellType> = {};
    columnTypeCoercions.forEach((type, index) => {
      if (type) {
        rec[index] = type;
      }
    });

    return rec;
  }
  return columnTypeCoercions;
};
