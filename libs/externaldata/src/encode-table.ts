import { Table } from '@apache-arrow/es5-cjs';

export function encodeTable(table: Table): string {
  return Buffer.from(table.serialize()).toString('base64');
}
