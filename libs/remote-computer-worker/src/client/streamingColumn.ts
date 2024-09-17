import type {
  SerializedType,
  Result,
  SerializedTypes,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value, getResultGenerator } from '@decipad/language-types';
import type { RecursiveDecoder } from '@decipad/remote-computer-codec';
import type { ClientWorkerContext } from './types';
import type { ReadSerializedColumnDecoder } from 'libs/language-types/src/Value';
import { getRemoteValue } from '../utils/getRemoteValue';
import { getRemoteMeta } from '../utils/getRemoteMeta';
import { empty } from '@decipad/generator-utils';

const recursiveDecoderToReadSerializedColumnDecoder =
  (
    decoder: RecursiveDecoder,
    type: SerializedType,
    decoders: Record<SerializedType['kind'], RecursiveDecoder>
  ): ReadSerializedColumnDecoder =>
  async (buffer, offset) =>
    decoder(type, buffer, offset, decoders);

export const streamingColumn = (
  ctx: ClientWorkerContext,
  type: SerializedTypes.Column | SerializedTypes.MaterializedColumn,
  valueId: string,
  decoders: Record<SerializedType['kind'], RecursiveDecoder>
): Result.ResultColumn => {
  return async function* generateValues(start = 0, end = Infinity) {
    const value = await getRemoteValue(ctx, valueId, start, end);

    if (value.byteLength === 0) {
      yield* empty();
      return;
    }

    const { cellType } = type;
    const decode = decoders[cellType.kind];
    const column = new Value.ReadSerializedColumn(
      cellType,
      recursiveDecoderToReadSerializedColumnDecoder(decode, cellType, decoders),
      new DataView(value),
      [],
      0,
      () => ({ labels: getRemoteMeta(ctx, valueId, start, end) })
    );
    yield* getResultGenerator(await column.getData())();
  };
};
