// eslint-disable-next-line no-restricted-imports
import type {
  SerializedType,
  Result,
  SerializedTypes,
} from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { Value, getResultGenerator } from '@decipad/language-types';
import type { ClientWorkerContext } from './types';
import type { RecursiveDecoder } from './valueDecoder';
import type { ReadSerializedColumnDecoder } from 'libs/language-types/src/Value';
import { getRemoteValue } from '../utils/getRemoteValue';

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

    const { cellType } = type;
    const decode = decoders[cellType.kind];
    const column = new Value.ReadSerializedColumn(
      cellType,
      recursiveDecoderToReadSerializedColumnDecoder(decode, type, decoders),
      new DataView(value),
      []
    );
    yield* getResultGenerator(await column.getData())();
  };
};
