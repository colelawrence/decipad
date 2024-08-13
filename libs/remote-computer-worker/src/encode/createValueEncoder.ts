/* eslint-disable no-console */
import { nanoid } from 'nanoid';
import type { Result } from '@decipad/language-interfaces';
import { Unknown } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import type { RemoteValueStore } from '../types';
import { initialBufferSize, maxBufferSize, pageSize } from './defaultConfig';
import { encodeString, valueEncoder } from '@decipad/remote-computer-codec';

export const createValueEncoder = (remoteValueStore: RemoteValueStore) => {
  const recursiveSerializeRemoteValue = async (
    blockId: string | undefined,
    buffer: DataView,
    offset: number,
    result: Result.Result
  ): Promise<number> => {
    let { type, value } = result;
    const { meta } = result;
    if (value == null) {
      value = Unknown;
      type = { kind: 'anything' };
    }
    switch (type.kind) {
      case 'anything':
      case 'pending':
      case 'nothing':
      case 'type-error':
      case 'boolean':
      case 'function':
      case 'number':
      case 'row':
      case 'tree':
      case 'range':
      case 'string':
      case 'date':
        return valueEncoder(type)(buffer, offset, value, meta);
      // these following types are held in the remoteValueStore
      case 'table':
      case 'materialized-table':
      case 'materialized-column':
      case 'column': {
        const valueId = nanoid();
        remoteValueStore.set(blockId, valueId, { type, value, meta });
        // just send the id of the value so that it can be streamed later
        return encodeString(buffer, offset, valueId);
      }
    }
  };

  return async (
    blockId: string | undefined,
    result: Result.Result
  ): Promise<ArrayBuffer> => {
    const targetBuffer = new Value.GrowableDataView(
      new ArrayBuffer(initialBufferSize, {
        maxByteLength: maxBufferSize,
      }),
      { pageSize }
    );
    const finalOffset = await recursiveSerializeRemoteValue(
      blockId,
      targetBuffer,
      0,
      result
    );

    return targetBuffer.seal(finalOffset);
  };
};
