import { produce } from 'immer';
import type { TableCellType, TableData } from './types';

// We'll be reassigning parameters this entire file, since it's all immer.
/* eslint-disable no-param-reassign */
export const changeVariableName = produce(
  (data: TableData, newName: string) => {
    data.variableName = newName;
  }
);

export const getTableLength = (data: TableData): number =>
  data.columns[0].cells.length;

export const addColumn = produce((data: TableData) => {
  data.columns.push({
    columnName: '',
    cellType: 'string',
    cells: Array.from({ length: getTableLength(data) }, () => ''),
  });
});

export const validateCell = (
  cellType: TableCellType,
  text: string
): boolean => {
  switch (cellType) {
    case 'number': {
      return !Number.isNaN(Number(text));
    }
    case 'string': {
      return true;
    }
  }
};

export const changeColumnType = produce(
  (data: TableData, columnIndex: number, newType: TableCellType) => {
    const column = data.columns[columnIndex];
    column.cellType = newType;

    // Validate existing data
    for (let i = 0; i < column.cells.length; i += 1) {
      if (!validateCell(newType, column.cells[i])) {
        column.cells[i] = '';
      }
    }
  }
);

export const changeColumnName = produce(
  (data: TableData, columnIndex: number, newName: string) => {
    data.columns[columnIndex].columnName = newName;
  }
);

export const removeRow = produce((data: TableData, rowIndex: number) => {
  if (getTableLength(data) === 1) {
    // Remove not the last one
    for (const { cells } of data.columns) {
      cells[0] = '';
    }
  } else {
    for (const { cells } of data.columns) {
      cells.splice(rowIndex, 1);
    }
  }
});

interface ChangeCellOptions {
  colIndex: number;
  rowIndex: number;
  newText: string;
}
export const changeCell = produce(
  (data: TableData, { colIndex, rowIndex, newText }: ChangeCellOptions) => {
    data.columns[colIndex].cells[rowIndex] = newText;
  }
);

export const addRow = produce((data: TableData) => {
  data.columns.forEach((col) => {
    col.cells.push('');
  });
});
