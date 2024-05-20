import type DeciNumber from '@decipad/number';
import { getDefined } from '@decipad/utils';
import { encodeBigInt } from './encodeBigInt';

export const encodeNumber = (
  buffer: DataView,
  _offset: number,
  value: DeciNumber
): number => {
  let offset = _offset;
  if (value.infinite) {
    const sign = Number(getDefined(value.s)) >= 0 ? 1 : -1;
    buffer.setInt8(offset, sign);
    offset += 1;
  } else {
    buffer.setUint8(offset, 0);
    offset += 1;

    if (value.s == null && value.d == null) {
      buffer.setUint8(offset, 0); // number is undefined
      offset += 1;
      return offset;
    }
    buffer.setUint8(offset, 1); // number is defined
    offset += 1;
    offset = encodeBigInt(
      buffer,
      offset,
      getDefined(value.s) * getDefined(value.n)
    );
    offset = encodeBigInt(buffer, offset, getDefined(value.d));
  }
  return offset;
};
