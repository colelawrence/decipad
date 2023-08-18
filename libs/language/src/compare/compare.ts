/* eslint-disable no-underscore-dangle */
// eslint-disable-next-line no-restricted-imports
import DeciNumber, {
  DeciNumberInput,
  N,
  isDeciNumberInput,
} from '@decipad/number';
import { zip } from '@decipad/utils';
import { DeepReadonly } from 'utility-types';
import {
  BooleanValue,
  Column,
  DateValue,
  NumberValue,
  RuntimeError,
  StringValue,
  Unknown,
  UnknownValue,
  Value,
} from '../value';

export type CompareResult = -1 | 0 | 1;

export type Comparable =
  | DeepReadonly<Value>
  | string
  | boolean
  | number
  | bigint
  | symbol
  | DeciNumber
  | DeciNumberInput
  | Value
  | ReadonlyArray<Comparable>;

/** Returns the sign of a comparison between two things, whatever they may be */
// eslint-disable-next-line complexity
function compareToNumber(a: Comparable, b: Comparable): number | bigint {
  if (
    a === UnknownValue ||
    a === Unknown ||
    b === UnknownValue ||
    b === Unknown
  ) {
    if (a === b) {
      return 0;
    }
    if (a === UnknownValue || a === Unknown) {
      return -1;
    }
    if (b === UnknownValue || b === Unknown) {
      return 1;
    }
  }
  if (typeof a === 'symbol' && typeof b === 'symbol') {
    if (a === b) {
      return 0;
    }
    return compare(a.toString(), b.toString());
  }
  if (typeof a === 'bigint' && typeof b === 'bigint') {
    return a - b;
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
  if (isDeciNumberInput(a) && isDeciNumberInput(b)) {
    return N(a).compare(N(b));
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
    if (a.moment == null) {
      return -1;
    }
    if (b.moment == null) {
      return 1;
    }
    return a.moment < b.moment ? -1 : a.moment === b.moment ? 0 : 1;
  }
  if (a instanceof Column && b instanceof Column) {
    return compare(a._values, b._values);
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    const lengthComparison = a.length - b.length;

    if (lengthComparison === 0) {
      for (const [aItem, bItem] of zip(a, b)) {
        const thisItem = compare(aItem, bItem);

        // eslint-disable-next-line no-await-in-loop
        if (thisItem !== 0) {
          return thisItem;
        }
      }
    }
    if (typeof a === 'symbol' || typeof b === 'symbol') {
      if (typeof a !== 'symbol') {
        return -1;
      }
      if (typeof b !== 'symbol') {
        return 1;
      }
      return 0;
    }

    return lengthComparison;
  }

  throw new RuntimeError(
    `Don't know how to compare ${a.toString()} (${typeof a}) against ${b.toString()} (${typeof b})`
  );
}

const sign = (diff: number | bigint): CompareResult => {
  if (typeof diff === 'number') {
    return diff > 0 ? 1 : diff < 0 ? -1 : 0;
  }
  return diff > 0n ? 1 : diff < 0n ? -1 : 0;
};

export const compare = (
  a: Comparable | undefined,
  b: Comparable | undefined
): CompareResult => {
  if (a == null || b == null) {
    if (a != null) {
      return -1;
    }
    if (b != null) {
      return 1;
    }
    return 0;
  }
  return sign(compareToNumber(a, b));
};
