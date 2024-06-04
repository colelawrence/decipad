import type { DeciNumber } from './types';

export const MAX_PRECISION = 15;
export const DEFAULT_PRECISION = 10;

export function safeNumberForPrecision(n: DeciNumber): [number, number] {
  const rounded = n.round(MAX_PRECISION).valueOf();
  const precise = n.valueOf();
  return [
    rounded,
    Number.isNaN(precise) || !Number.isFinite(precise) ? rounded : precise,
  ];
}
