// eslint-disable-next-line no-restricted-imports
import { min as minFraction } from '@decipad/fraction';
import DeciNumber, { isFinite, isInfinite, isUndefined, N } from '.';
import { FiniteNumber } from './types';

const isNegativeInfinite = (n: DeciNumber) => isInfinite(n) && n.s < 0n;

export const min = (...ns: DeciNumber[]): DeciNumber => {
  for (const n of ns) {
    if (isUndefined(n)) {
      return DeciNumber.undefined();
    }
    if (isNegativeInfinite(n)) {
      return DeciNumber.infinite(-1);
    }
  }
  return N(minFraction(...(ns.filter(isFinite) as unknown as FiniteNumber[])));
};
