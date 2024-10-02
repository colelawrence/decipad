import { Result } from '@decipad/language-interfaces';
import { RecursiveDecoder } from './types';
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import { getInstanceof } from '@decipad/utils';
import DeciNumber from '@decipad/number';

export const decodeTrend: RecursiveDecoder = async (
  type,
  buffer,
  _offset,
  decoders
) => {
  if (type.kind !== 'trend') {
    throw new TypeError('Trend: Expected trend type');
  }
  let offset = _offset;

  const hasFirst = buffer.getUint8(offset) !== 0;
  offset += 1;
  let first: Result.OneResult | undefined;
  if (hasFirst) {
    [first, offset] = await decoders[type.trendOf.kind](
      type.trendOf,
      buffer,
      offset,
      decoders
    );
  }

  const hasLast = buffer.getUint8(offset) !== 0;
  offset += 1;
  let last: Result.OneResult | undefined;
  if (hasLast) {
    [last, offset] = await decoders[type.trendOf.kind](
      type.trendOf,
      buffer,
      offset,
      decoders
    );
  }

  const hasDiff = buffer.getUint8(offset) !== 0;
  offset += 1;
  let diff: Result.OneResult | undefined;
  if (hasDiff) {
    [diff, offset] = await decoders[type.trendOf.kind](
      type.trendOf,
      buffer,
      offset,
      decoders
    );
  }

  return [
    Value.Trend.from(
      first ? getInstanceof(first, DeciNumber) : undefined,
      last ? getInstanceof(last, DeciNumber) : undefined,
      diff ? getInstanceof(diff, DeciNumber) : undefined
    ),
    offset,
  ];
};
