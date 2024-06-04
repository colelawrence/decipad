// eslint-disable-next-line no-restricted-imports
import { min as minFraction } from '@decipad/fraction';
// eslint-disable-next-line no-restricted-imports
import type Fraction from '@decipad/fraction';
import { DeciNumber, N, isFinite, isInfinite, isUndefined } from './DeciNumber';
import type { DeciNumber as TDeciNumber } from './types';

const isNegativeInfinite = (n: TDeciNumber) => isInfinite(n) && (n.s ?? 0) < 0n;

export const min = (...ns: TDeciNumber[]): TDeciNumber => {
  for (const n of ns) {
    if (isUndefined(n)) {
      return DeciNumber.undefined();
    }
    if (isNegativeInfinite(n)) {
      return DeciNumber.infinite(-1);
    }
  }
  return N(minFraction(...(ns.filter(isFinite) as unknown as Fraction[])));
};
