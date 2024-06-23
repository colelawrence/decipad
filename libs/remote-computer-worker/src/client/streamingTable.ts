import type {
  SerializedType,
  Result,
  SerializedTypes,
} from '@decipad/language-interfaces';
import type { RecursiveDecoder } from '@decipad/remote-computer-codec';
import { decodeString } from '@decipad/remote-computer-codec';
import type { ClientWorkerContext, StreamingValue } from './types';
import { getRemoteValue } from '../utils/getRemoteValue';

export const streamingTable = async (
  ctx: ClientWorkerContext,
  type: SerializedTypes.Table | SerializedTypes.MaterializedTable,
  valueId: string,
  decoders: Record<SerializedType['kind'], RecursiveDecoder>,
  streamingValue: StreamingValue
): Promise<Result.ResultTable> => {
  const buffer = new DataView(await getRemoteValue(ctx, valueId));
  let offset = 0;
  const colCount = buffer.getUint32(offset);
  offset += 4;

  if (colCount !== type.columnTypes.length) {
    throw new TypeError(
      `Expected ${type.columnTypes.length} columns, got ${colCount}`
    );
  }

  const columns: (Result.ResultColumn | Result.ResultTable)[] = [];
  for (let colIndex = 0; colIndex < type.columnTypes.length; colIndex++) {
    let colValueId: string;
    [colValueId, offset] = decodeString(buffer, offset);
    const colType: SerializedType = {
      kind: 'column',
      cellType: type.columnTypes[colIndex],
      indexedBy: type.indexName,
    };
    // eslint-disable-next-line no-await-in-loop
    const colValue = await streamingValue(ctx, colType, colValueId, decoders);

    columns.push(colValue);
  }

  return columns as Result.ResultTable;
};
