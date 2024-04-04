import { N } from '@decipad/number';
import type { Unit } from '../Unit/Unit';

export function u(unit: string | Unit, opts: Partial<Unit> = {}): Unit {
  if (typeof unit === 'string') {
    unit = {
      unit,
      exp: N(1),
      multiplier: N(1),
      known: true,
    };
  }
  return { ...unit, ...opts };
}

export function U(units: string | Unit | Unit[], opts?: Partial<Unit>): Unit[] {
  const unitsArr = Array.isArray(units) ? units : [units];
  return unitsArr.map((unit) => u(unit, opts));
}
