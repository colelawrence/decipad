import FFraction, { FractionLike } from '@decipad/fraction';
import { parseUnit, Unit, Units } from '@decipad/language';

export function u(unit: string | Unit, opts: Partial<Unit> = {}): Unit {
  if (typeof unit === 'string') {
    // eslint-disable-next-line no-param-reassign
    unit = {
      unit,
      exp: new FFraction(1),
      multiplier: new FFraction(1),
      known: true,
    };
  }
  return { ...unit, ...opts };
}

export function U(units: string | Unit | Unit[], opts?: Partial<Unit>): Units {
  const unitsArr = Array.isArray(units) ? units : [units];
  return {
    type: 'units',
    args: unitsArr.map((unit) => u(unit, opts)),
  };
}
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

export const usd = U('USD', { baseSuperQuantity: 'currency' });
export const usdShort = U('$', { baseSuperQuantity: 'currency' });
export const usdPerDay: Units = {
  type: 'units',
  args: [
    u('USD', { baseSuperQuantity: 'currency' }),
    u('days', { exp: new FFraction(-1) }),
  ],
};
export const metersPerDay: Units = {
  type: 'units',
  args: [u('meters'), u('days', { exp: new FFraction(-1) })],
};

export const bananasPerDay: Units = {
  type: 'units',
  args: [u('banana'), u('days', { exp: new FFraction(-1) })],
};

export const perDay: Units = {
  type: 'units',
  args: [u('days', { exp: new FFraction(-1) })],
};

export const perBanana: Units = {
  type: 'units',
  args: [u('banana', { exp: new FFraction(-1) })],
};

export const perEuros: Units = {
  type: 'units',
  args: [u('euro', { exp: new FFraction(-1) })],
};

export const km: Units = U(u('m', { multiplier: new FFraction(1000) }));

export const kmPerSecond: Units = {
  type: 'units',
  args: [
    u('m', { multiplier: new FFraction(1000) }),
    u('second', { exp: new FFraction(-1) }),
  ],
};

export const metersPerSecond: Units = {
  type: 'units',
  args: [u('m'), u('second', { exp: new FFraction(-1) })],
};

export function makeFractionUnitTuple(
  fraction: FFraction,
  unit: string
): [FFraction, Units] {
  //
  // fraction 1/1000 km is 1/1000 m (displayed as km, multipliers are just pretty things)
  //
  const parsedUnit = parseUnit(unit);
  return [
    fraction.mul(parsedUnit.multiplier),
    { type: 'units', args: [parsedUnit] },
  ];
}
