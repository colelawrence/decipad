import { SerializedType } from '@decipad/language';

export type TableCellType =
  | Extract<SerializedType, { kind: 'number' }>
  | Extract<SerializedType, { kind: 'string' }>
  | Extract<SerializedType, { kind: 'date' }>;

export interface TableColumn {
  columnName: string;
  cells: string[];
  cellType: TableCellType;
}

export interface TableData {
  variableName: string;
  columns: TableColumn[];
}
