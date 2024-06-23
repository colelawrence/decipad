export type EncodeDefinitely<TValue> = (
  buffer: DataView,
  offset: number,
  value: TValue
) => number;

export const encodeMaybe = <TValue>(
  buffer: DataView,
  offset: number,
  value: TValue | undefined,
  encode: EncodeDefinitely<TValue>
) => {
  if (value === undefined) {
    buffer.setUint8(offset, offset);
    return offset + 1;
  }
  buffer.setUint8(offset, 1);
  return encode(buffer, offset + 1, value);
};
