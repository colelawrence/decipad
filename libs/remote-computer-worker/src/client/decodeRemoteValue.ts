import type { Result, SerializedType } from '@decipad/language-interfaces';
import {
  valueDecoder,
  decodeString,
  decoders,
} from '@decipad/remote-computer-codec';
import type { ClientWorkerContext } from './types';
import { streamingValue } from './streamingValue';

export const decodeRemoteValue = async (
  ctx: ClientWorkerContext,
  buffer: DataView,
  _offset: number,
  type: SerializedType
): Promise<[Result.OneResult, number, string?]> => {
  let offset = _offset;
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
      return valueDecoder(type)(buffer, offset);
    // these following types are held in the remoteValueStore
    case 'table':
    case 'materialized-table':
    case 'materialized-column':
    case 'column': {
      let valueId;
      [valueId, offset] = decodeString(buffer, offset);
      const value = await streamingValue(ctx, type, valueId, decoders);
      ctx.finalizationRegistry.register(value, valueId);
      ctx.refCounter.set(valueId, (ctx.refCounter.get(valueId) || 0) + 1);
      return [value, offset, valueId];
    }
  }
};
