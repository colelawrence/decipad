// eslint-disable-next-line no-restricted-imports
import DeciNumber, {
  isDeciNumberInput,
  N,
  DeciNumberInput,
} from '@decipad/number';
import { zip } from '@decipad/utils';
import { isColumnLike } from '@decipad/column';

export type CompareResult = -1 | 0 | 1;

export type Comparable =
  | string
  | boolean
  | number
  | bigint
  | symbol
  | undefined
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

  if (isColumnLike(a) && isColumnLike(b)) {
    return compareToNumber(
      a.values as ReadonlyArray<Comparable>,
      b.values as ReadonlyArray<Comparable>
    );
  }
  if (Array.isArray(a) && Array.isArray(b)) {
    const lengthComparison = a.length - b.length;

    if (lengthComparison === 0) {
      for (const [aItem, bItem] of zip(a, b)) {
        // eslint-disable-next-line no-use-before-define
        const thisItem = compare(aItem, bItem);

        if (thisItem !== 0) {
          return thisItem;
        }
      }
    }

    return lengthComparison;
  }
  if (typeof a === 'symbol' || typeof b === 'symbol') {
    return compareToNumber(a?.toString(), b?.toString());
  }

  // eslint-disable-next-line no-console
  console.error(a, b);
  throw new Error(
    `Don't know how to compare ${a?.toString()} (${typeof a}) against ${b?.toString()} (${typeof b})`
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
    if (a != null) {
      return -1;
    }
    if (b != null) {
      return 1;
    }
    return 0;
  }
  return sign(compareToNumber(a, b));
}
