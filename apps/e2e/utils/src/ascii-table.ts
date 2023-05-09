// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import AsciiTable from 'ascii-table';
import { Table } from './types';

export const toAsciiTable = (table: Table): string => {
  const aTable = new AsciiTable(table.name);
  aTable.setHeading(...table.columnHeaders.map((header) => header.name));
  for (const row of table.rows) {
    aTable.addRow(...row.cells);
  }
  return aTable.toString();
};
