/* eslint-disable no-bitwise */
const SIGNIFICANT_BITS = 7n;
const CONTINUE = 1n << SIGNIFICANT_BITS;
const REST_MASK = CONTINUE - 1n;

export const decodeBigInt = (
  buffer: DataView,
  _offset: number
): [bigint, number] => {
  let offset = _offset;
  const length = buffer.getUint32(offset);
  offset += 4;

  let value = -1n;
  for (
    let thisOffset = offset + length - 1;
    thisOffset >= offset;
    --thisOffset
  ) {
    value += 1n;
    value <<= SIGNIFICANT_BITS;
    value |= BigInt(buffer.getUint8(thisOffset)) & REST_MASK;
  }
  offset += length;

  if ((value & 1n) === 1n) {
    value >>= 1n;
    value += 1n;
    value = -value;
  } else {
    value >>= 1n;
  }

  return [value, offset];
};
