import { Table } from '@apache-arrow/es5-cjs';
import { DataTable } from './DataTable';
import { bufferBody } from './buffer-body';

export async function resolveArrow(
  bodyStream: AsyncIterable<ArrayBuffer>
): Promise<DataTable> {
  return Table.from([await bufferBody(bodyStream)]);
}
