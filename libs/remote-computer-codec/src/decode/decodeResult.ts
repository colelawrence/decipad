// eslint-disable-next-line no-restricted-imports
import type { Result, SerializedType } from '@decipad/language-interfaces';
import type { RecursiveDecoder } from './types';
import { decodeType } from './decodeType';
import { decodeResultMeta } from './decodeResultMeta';

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

  const [meta, newOffset] = await decodeResultMeta(buffer, offset);
  offset = newOffset;

  return [{ type, value, meta }, offset];
};
