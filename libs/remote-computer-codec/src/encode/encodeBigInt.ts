/* eslint-disable no-bitwise */
const SIGNIFICANT_BITS = 7n;
const CONTINUE = 1n << SIGNIFICANT_BITS;
const REST_MASK = CONTINUE - 1n;

const preciselyEncodeBigint = (
  buffer: DataView,
  _offset: number,
  _value: bigint
): number => {
  let offset = _offset;
  let value = _value;
  if (value < 0) {
    value = -value;
    --value;
    value <<= 1n;
    value |= 1n;
  } else {
    value <<= 1n;
  }

  while (value >= CONTINUE) {
    buffer.setUint8(offset, Number((value & REST_MASK) | CONTINUE));
    value >>= SIGNIFICANT_BITS;
    value -= 1n;
    offset += 1;
  }

  buffer.setUint8(offset, Number(value));
  offset += 1;

  return offset;
};

export const encodeBigInt = (
  buffer: DataView,
  originalOffset: number,
  value: bigint
): number => {
  // start at offset 4 so that we can write the length before
  const offset = preciselyEncodeBigint(buffer, originalOffset + 4, value);
  const sizeInBytes = offset - originalOffset - 4;
  buffer.setUint32(originalOffset, sizeInBytes);
  return offset;
};
