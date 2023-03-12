import DeciNumber, { DeciNumberInputWithNumerator, N } from '@decipad/number';
import { parseUnit, Unit } from '@decipad/language';

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

export function u(unit: string | Unit, opts: Partial<Unit> = {}): Unit {
  if (typeof unit === 'string') {
    // eslint-disable-next-line no-param-reassign
    unit = { unit, exp: F(1), multiplier: F(1), known: true };
  }
  return { ...unit, ...opts };
}

export function U(units: string | Unit | Unit[], opts?: Partial<Unit>): Unit[] {
  const unitsArr = Array.isArray(units) ? units : [units];
  return unitsArr.map((unit) => u(unit, opts));
}

export const usd = U('USD', { baseSuperQuantity: 'currency' });
export const usdShort = U('$', { baseSuperQuantity: 'currency' });
export const usdPerDay: Unit[] = [
  u('USD', { baseSuperQuantity: 'currency' }),
  u('days', { exp: N(-1) }),
];
export const metersPerDay: Unit[] = [u('meters'), u('days', { exp: N(-1) })];

export const bananasPerDay: Unit[] = [u('banana'), u('days', { exp: N(-1) })];

export const perDay: Unit[] = [u('days', { exp: N(-1) })];

export const perBanana: Unit[] = [u('banana', { exp: N(-1) })];

export const perEuros: Unit[] = [u('euro', { exp: N(-1) })];

export const km: Unit[] = U(u('m', { multiplier: N(1000) }));

export const kmPerSecond: Unit[] = [
  u('m', { multiplier: N(1000) }),
  u('second', { exp: N(-1) }),
];

export const metersPerSecond: Unit[] = [
  u('meter'),
  u('second', { exp: N(-1) }),
];

export function makeFractionUnitTuple(
  fraction: DeciNumber,
  unit: string
): [DeciNumber, Unit[]] {
  //
  // fraction 1/1000 km is 1/1000 m (displayed as km, multipliers are just pretty things)
  //
  const parsedUnit = parseUnit(unit);
  return [fraction.mul(parsedUnit.multiplier), [parsedUnit]];
}
