export interface TableColumnHeader {
  name: string;
}

export interface TableRow {
  cells: string[];
}

export interface Table {
  name: string;
  columnHeaders: TableColumnHeader[];
  rows: TableRow[];
}
