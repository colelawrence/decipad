import DeciNumber, { N } from '@decipad/number';
import { decodeBigInt } from './decodeBigInt';

export const decodeNumber = (
  buffer: DataView,
  _offset: number
): [DeciNumber, number] => {
  let offset = _offset;
  const infiniteSign = buffer.getInt8(offset);
  offset += 1;
  if (infiniteSign !== 0) {
    return [DeciNumber.infinite(infiniteSign as -1 | 1), offset];
  }

  const isDefined = buffer.getUint8(offset);
  offset += 1;
  if (isDefined === 0) {
    return [DeciNumber.undefined(), offset];
  }

  let n: bigint;
  let d: bigint;
  // eslint-disable-next-line prefer-const
  [n, offset] = decodeBigInt(buffer, offset);
  // eslint-disable-next-line prefer-const
  [d, offset] = decodeBigInt(buffer, offset);
  return [N(n, d), offset];
};
