import { Table, tableToIPC } from 'apache-arrow';

export function encodeTable(table: Table): string {
  return Buffer.from(tableToIPC(table)).toString('base64');
}
