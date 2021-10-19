export type TableCellType = 'number' | 'string';

export interface TableColumn {
  columnName: string;
  cells: string[];
  cellType: TableCellType;
}

export interface TableData {
  variableName: string;
  columns: TableColumn[];
}
