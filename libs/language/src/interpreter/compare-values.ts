import Fraction from '@decipad/fraction';
import { RuntimeError } from './RuntimeError';
import {
  Value,
  FractionValue,
  StringValue,
  BooleanValue,
  Date as DateValue,
} from './Value';

/** Returns the sign of a comparison between two things, whatever they may be */
export function compare(
  a: Value | string | number | BigInt | Fraction,
  b: Value | string | number | BigInt | Fraction
): -1 | 0 | 1 {
  if (a instanceof Fraction && b instanceof Fraction) {
    return sign(a.compare(b));
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return sign(a > b ? 1 : a === b ? 0 : -1);
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return sign(a - b);
  }
  if (typeof a === 'bigint' && typeof b === 'bigint') {
    return sign(a - b);
  }
  if (a instanceof FractionValue && b instanceof FractionValue) {
    return sign(a.value.compare(b.value));
  }
  if (a instanceof StringValue && b instanceof StringValue) {
    return sign(a.value === b.value ? 0 : a.value < b.value ? -1 : 1);
  }
  if (a instanceof BooleanValue && b instanceof BooleanValue) {
    return sign(((a.value && 1) || 0) - ((b.value && 1) || 0));
  }
  if (a instanceof DateValue && b instanceof DateValue) {
    return sign(a.moment < b.moment ? -1 : a.moment === b.moment ? 0 : 1);
  }
  throw new RuntimeError(`Don't know how to compare ${a} against ${b}`);
}

const sign = (diff: number | BigInt) => {
  if (typeof diff === 'number') {
    return diff > 0 ? 1 : diff < 0 ? -1 : 0;
  }
  return diff > 0n ? 1 : diff < 0n ? -1 : 0;
};
