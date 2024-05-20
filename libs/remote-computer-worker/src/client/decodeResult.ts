// eslint-disable-next-line no-restricted-imports
import type { Result, SerializedType } from '@decipad/language-types';
import type { RecursiveDecoder } from './valueDecoder';
import { decodeType } from './decodeType';

export const decodeResult = async (
  buffer: DataView,
  _offset: number,
  decoders: Record<SerializedType['kind'], RecursiveDecoder>
): Promise<[Result.Result, number]> => {
  let offset = _offset;

  let type: SerializedType;
  // eslint-disable-next-line prefer-const
  [type, offset] = decodeType(buffer, offset);

  let value: Result.OneResult;
  // eslint-disable-next-line prefer-const
  [value, offset] = await decoders[type.kind](type, buffer, offset, decoders);
  return [{ type, value }, offset];
};
