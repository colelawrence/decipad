import {
  Unknown,
  type Result,
  type SerializedType,
} from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import type { RecursiveEncoder } from './types';

export const encodeTrend = async (
  result: Result.Result,
  buffer: DataView,
  _offset: number,
  encoders: Record<SerializedType['kind'], RecursiveEncoder>
): Promise<number> => {
  const { type, value, meta } = result;
  if (type.kind !== 'trend') {
    // eslint-disable-next-line no-console
    console.warn('Unexpected type', type);
    throw new TypeError('Trend: Expected trend type');
  }
  let offset = _offset;
  if (value === Unknown) {
    buffer.setUint8(offset, 0);
    offset += 1;
    return offset;
  }
  buffer.setUint8(offset, 1);
  offset += 1;
  if (!Value.isTrendValue(value)) {
    throw new TypeError('Trend: Expected trend value');
  }

  buffer.setUint8(offset, value.first != null ? 1 : 0);
  offset += 1;

  if (value.first != null) {
    offset = await encoders.number(
      { type: type.trendOf, value: value.first, meta },
      buffer,
      offset,
      encoders
    );
  }

  buffer.setUint8(offset, value.last != null ? 1 : 0);
  offset += 1;

  if (value.last != null) {
    offset = await encoders.number(
      { type: type.trendOf, value: value.last, meta },
      buffer,
      offset,
      encoders
    );
  }

  buffer.setUint8(offset, value.diff != null ? 1 : 0);
  offset += 1;

  if (value.diff != null) {
    offset = await encoders.number(
      { type: type.trendOf, value: value.diff, meta },
      buffer,
      offset,
      encoders
    );
  }

  return offset;
};
