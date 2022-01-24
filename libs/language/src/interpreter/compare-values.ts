import Fraction from '@decipad/fraction';
import { RuntimeError } from './RuntimeError';
import {
  Value,
  FractionValue,
  StringValue,
  BooleanValue,
  Date as DateValue,
} from './Value';

export type CompareResult = -1 | 0 | 1;

/** Returns the sign of a comparison between two things, whatever they may be */
export function compareToNumber(
  a: Value | string | boolean | number | BigInt | Fraction,
  b: Value | string | boolean | number | BigInt | Fraction
): number | bigint {
  if (a instanceof Fraction && b instanceof Fraction) {
    return a.compare(b);
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return a > b ? 1 : a === b ? 0 : -1;
  }
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return Number(a) - Number(b);
  }
  if (typeof a === 'bigint' && typeof b === 'bigint') {
    return a - b;
  }
  if (a instanceof FractionValue && b instanceof FractionValue) {
    return a.value.compare(b.value);
  }
  if (a instanceof StringValue && b instanceof StringValue) {
    return a.value === b.value ? 0 : a.value < b.value ? -1 : 1;
  }
  if (a instanceof BooleanValue && b instanceof BooleanValue) {
    return ((a.value && 1) || 0) - ((b.value && 1) || 0);
  }
  if (a instanceof DateValue && b instanceof DateValue) {
    return a.moment < b.moment ? -1 : a.moment === b.moment ? 0 : 1;
  }
  throw new RuntimeError(`Don't know how to compare ${a} against ${b}`);
}

const sign = (diff: number | BigInt): CompareResult => {
  if (typeof diff === 'number') {
    return diff > 0 ? 1 : diff < 0 ? -1 : 0;
  }
  return diff > 0n ? 1 : diff < 0n ? -1 : 0;
};

export function compare(
  a: Value | string | boolean | number | BigInt | Fraction,
  b: Value | string | boolean | number | BigInt | Fraction
): CompareResult {
  return sign(compareToNumber(a, b));
}
