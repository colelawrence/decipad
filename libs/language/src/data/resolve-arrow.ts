import { tableFromIPC } from 'apache-arrow';
import { DataTable } from './DataTable';
import { bufferBody } from './buffer-body';

export async function resolveArrow(
  bodyStream: AsyncIterable<ArrayBuffer>
): Promise<DataTable> {
  return tableFromIPC(await bufferBody(bodyStream));
}
