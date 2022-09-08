import { SpreadsheetColumn, SpreadsheetRow } from '../types';

export const pivot = (rows: SpreadsheetRow[]): SpreadsheetColumn[] => {
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
