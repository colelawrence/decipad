// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line import/no-extraneous-dependencies
import AsciiTable from 'ascii-table';

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

export const toAsciiTable = (table: Table): string => {
  const aTable = new AsciiTable(table.name);
  aTable.setHeading(...table.columnHeaders.map((header) => header.name));
  for (const row of table.rows) {
    aTable.addRow(...row.cells);
  }
  return aTable.toString();
};
