import FFraction, { FractionLike } from '@decipad/fraction';
import { Unit, Units } from '@decipad/language';

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
