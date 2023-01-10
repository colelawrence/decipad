// eslint-disable-next-line no-restricted-imports
import { max as maxFraction } from '@decipad/fraction';
import DeciNumber, { isFinite, isInfinite, isUndefined, N } from '.';
import { FiniteNumber } from './types';

const isPositiveInfinite = (n: DeciNumber) => isInfinite(n) && n.s < 0n;

export const max = (...ns: DeciNumber[]): DeciNumber => {
  for (const n of ns) {
    if (isUndefined(n)) {
      return DeciNumber.undefined();
    }
    if (isPositiveInfinite(n)) {
      return DeciNumber.infinite();
    }
  }
  return N(maxFraction(...(ns.filter(isFinite) as unknown as FiniteNumber[])));
};
