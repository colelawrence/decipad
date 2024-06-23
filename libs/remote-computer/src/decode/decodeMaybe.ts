import type { PromiseOrType } from '@decipad/utils';

export type DecodeDefinitely<TValue> = (
  buffer: DataView,
  offset: number
) => PromiseOrType<TValue>;

export const decodeMaybe = <TValue>(
  buffer: DataView,
  offset: number,
  decode: DecodeDefinitely<TValue>
) => {
  const isDefined = buffer.getUint8(offset);
  if (isDefined === 0) {
    return undefined;
  }
  return decode(buffer, offset + 1);
};
