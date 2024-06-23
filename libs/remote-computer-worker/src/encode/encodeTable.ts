import { nanoid } from 'nanoid';
import type { Result, SerializedType } from '@decipad/language-interfaces';
import { encodeString } from '@decipad/remote-computer-codec';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { initialBufferSize, maxBufferSize, pageSize } from './defaultConfig';
import type { RemoteValueStore } from '../types';

export const encodeTable = async (
  remoteValueStore: RemoteValueStore,
  type: Result.Result['type'],
  value: Result.Result['value']
): Promise<ArrayBuffer> => {
  if (type.kind !== 'table' && type.kind !== 'materialized-table') {
    throw new TypeError(`Expected table-like type and got ${type.kind}`);
  }
  let offset = 0;
  if (!Array.isArray(value)) {
    throw new TypeError('Table: Expected array');
  }

  const targetBuffer = new Value.GrowableDataView(
    new ArrayBuffer(initialBufferSize, {
      maxByteLength: maxBufferSize,
    }),
    { pageSize }
  );

  targetBuffer.setUint32(offset, value.length);
  offset += 4;

  let colIndex = -1;
  for (const col of value) {
    colIndex += 1;
    const encoderType =
      typeof col === 'function' ? 'column' : 'materialized-column';
    const encoderSType: SerializedType = {
      kind: encoderType,
      cellType: type.columnTypes[colIndex],
      indexedBy: type.indexName,
    };
    const valueId = nanoid();
    remoteValueStore.set(valueId, { type: encoderSType, value: col });
    // just send the id of the value so that it can be streamed later
    offset = encodeString(targetBuffer, offset, valueId);
  }

  return targetBuffer.seal(offset);
};
