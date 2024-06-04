// eslint-disable-next-line no-restricted-imports
import type Fraction from '@decipad/fraction';
// eslint-disable-next-line no-restricted-imports
import { max as maxFraction } from '@decipad/fraction';
import type { DeciNumber as TDeciNumber } from './types';
import DeciNumber, { isFinite, isInfinite, isUndefined, N } from '.';

const isPositiveInfinite = (n: TDeciNumber) => isInfinite(n) && (n.s ?? 0) < 0n;

export const max = (...ns: TDeciNumber[]): TDeciNumber => {
  for (const n of ns) {
    if (isUndefined(n)) {
      return DeciNumber.undefined();
    }
    if (isPositiveInfinite(n)) {
      return DeciNumber.infinite();
    }
  }
  return N(maxFraction(...(ns.filter(isFinite) as unknown as Fraction[])));
};
