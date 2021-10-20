export type TableCellType =
  | 'number'
  | 'string'
  | 'date/time'
  | 'date/day'
  | 'date/month'
  | 'date/year';

export interface TableColumn {
  columnName: string;
  cells: string[];
  cellType: TableCellType;
}

export interface TableData {
  variableName: string;
  columns: TableColumn[];
}
