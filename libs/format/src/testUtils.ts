import FFraction, { FractionLike } from '@decipad/fraction';
import { parseUnit, Unit } from '@decipad/language';

export function F(n: number | bigint, d?: number | bigint): FFraction;
export function F(n: string | FFraction | FractionLike): FFraction;
export function F(
  n: number | bigint | string | FFraction | FractionLike,
  d: number | bigint = 1n
) {
  return typeof n === 'number' || typeof n === 'bigint'
    ? new FFraction(n, d)
    : new FFraction(n as string);
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
  u('days', { exp: new FFraction(-1) }),
];
export const metersPerDay: Unit[] = [
  u('meters'),
  u('days', { exp: new FFraction(-1) }),
];

export const bananasPerDay: Unit[] = [
  u('banana'),
  u('days', { exp: new FFraction(-1) }),
];

export const perDay: Unit[] = [u('days', { exp: new FFraction(-1) })];

export const perBanana: Unit[] = [u('banana', { exp: new FFraction(-1) })];

export const perEuros: Unit[] = [u('euro', { exp: new FFraction(-1) })];

export const km: Unit[] = U(u('m', { multiplier: new FFraction(1000) }));

export const kmPerSecond: Unit[] = [
  u('m', { multiplier: new FFraction(1000) }),
  u('second', { exp: new FFraction(-1) }),
];

export const metersPerSecond: Unit[] = [
  u('m'),
  u('second', { exp: new FFraction(-1) }),
];

export function makeFractionUnitTuple(
  fraction: FFraction,
  unit: string
): [FFraction, Unit[]] {
  //
  // fraction 1/1000 km is 1/1000 m (displayed as km, multipliers are just pretty things)
  //
  const parsedUnit = parseUnit(unit);
  return [fraction.mul(parsedUnit.multiplier), [parsedUnit]];
}
