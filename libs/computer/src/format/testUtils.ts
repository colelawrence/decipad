import type { DeciNumberInputWithNumerator } from '@decipad/number';
import type DeciNumber from '@decipad/number';
import { N } from '@decipad/number';
import type { Unit as TUnit } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { parseUnit } from '@decipad/language';

export function F(n: number | bigint, d?: number | bigint): DeciNumber;
export function F(
  n: string | DeciNumber | DeciNumberInputWithNumerator
): DeciNumber;
export function F(
  n: number | bigint | string | DeciNumber | DeciNumberInputWithNumerator,
  d: number | bigint = 1n
) {
  return typeof n === 'number' || typeof n === 'bigint'
    ? N(n, d)
    : N(n as string | number | bigint);
}

export function u(unit: string | TUnit, opts: Partial<TUnit> = {}): TUnit {
  if (typeof unit === 'string') {
    // eslint-disable-next-line no-param-reassign
    unit = { unit, exp: F(1), multiplier: F(1), known: true };
  }
  return { ...unit, ...opts };
}

export function U(
  units: string | TUnit | TUnit[],
  opts?: Partial<TUnit>
): TUnit[] {
  const unitsArr = Array.isArray(units) ? units : [units];
  return unitsArr.map((unit) => u(unit, opts));
}

export const usd = U('USD', { baseSuperQuantity: 'currency' });
export const usdShort = U('$', { baseSuperQuantity: 'currency' });
export const usdPerDay: TUnit[] = [
  u('USD', { baseSuperQuantity: 'currency' }),
  u('days', { exp: N(-1) }),
];
export const metersPerDay: TUnit[] = [u('meters'), u('days', { exp: N(-1) })];

export const bananasPerDay: TUnit[] = [u('banana'), u('days', { exp: N(-1) })];

export const usdPerMonthPerWorker: TUnit[] = [
  ...usd,
  u('month', { exp: N(-1) }),
  u('worker', { exp: N(-1) }),
];

export const perDay: TUnit[] = [u('days', { exp: N(-1) })];

export const perBanana: TUnit[] = [u('banana', { exp: N(-1) })];

export const perEuros: TUnit[] = [u('euro', { exp: N(-1) })];

export const km: TUnit[] = U(u('m', { multiplier: N(1000) }));

export const kmPerSecond: TUnit[] = [
  u('m', { multiplier: N(1000) }),
  u('second', { exp: N(-1) }),
];

export const metersPerSecond: TUnit[] = [
  u('meter'),
  u('second', { exp: N(-1) }),
];

export function makeFractionUnitTuple(
  fraction: DeciNumber,
  unit: string
): [DeciNumber, TUnit[]] {
  //
  // fraction 1/1000 km is 1/1000 m (displayed as km, multipliers are just pretty things)
  //
  const parsedUnit = parseUnit(unit);
  return [fraction.mul(parsedUnit.multiplier), [parsedUnit]];
}
