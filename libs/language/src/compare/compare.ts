// eslint-disable-next-line no-restricted-imports
import DeciNumber, {
  isDeciNumberInput,
  N,
  DeciNumberInput,
} from '@decipad/number';
import { zip } from '@decipad/utils';
import { DeepReadonly } from 'utility-types';
import {
  RuntimeError,
  Value,
  NumberValue,
  StringValue,
  BooleanValue,
  DateValue,
  isColumnLike,
} from '../value';

export type CompareResult = -1 | 0 | 1;

export type Comparable =
  | DeepReadonly<Value>
  | string
  | boolean
  | number
  | bigint
  | DeciNumber
  | DeciNumberInput
  | ReadonlyArray<Comparable>;

/** Returns the sign of a comparison between two things, whatever they may be */
function compareToNumber(a: Comparable, b: Comparable): number | bigint {
  if (isDeciNumberInput(a) && isDeciNumberInput(b)) {
    return N(a).compare(N(b));
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
  if (a instanceof NumberValue && b instanceof NumberValue) {
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
  if (isColumnLike(a) && isColumnLike(b)) {
    return compareToNumber(a.values, b.values);
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    const lengthComparison = a.length - b.length;

    if (lengthComparison === 0) {
      for (const [aItem, bItem] of zip(a, b)) {
        const thisItem = compare(aItem, bItem);

        if (thisItem !== 0) {
          return thisItem;
        }
      }
    }

    return lengthComparison;
  }
  console.log(a, b);
  throw new RuntimeError(
    `Don't know how to compare ${a} (${typeof a}) against ${b} (${typeof b})`
  );
}

const sign = (diff: number | bigint): CompareResult => {
  if (typeof diff === 'number') {
    return diff > 0 ? 1 : diff < 0 ? -1 : 0;
  }
  return diff > 0n ? 1 : diff < 0n ? -1 : 0;
};

export function compare(
  a: Comparable | undefined,
  b: Comparable | undefined
): CompareResult {
  if (a == null || b == null) {
    return 0;
  }
  return sign(compareToNumber(a, b));
}
