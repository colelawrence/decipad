import { SpreadsheetValue, SpreadsheetColumn } from '../types';

export const pivot = (rows: SpreadsheetValue[][]): SpreadsheetColumn[] => {
  const columns: SpreadsheetColumn[] = [];
  for (const row of rows) {
    row.forEach((cell, columnIndex) => {
      const column: SpreadsheetColumn = columns[columnIndex] || [];
      column.push(cell);
      columns[columnIndex] = column;
    });
  }
  return columns;
};
