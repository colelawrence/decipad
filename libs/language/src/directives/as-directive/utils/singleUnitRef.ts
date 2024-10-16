import { Unit as TUnit } from '@decipad/language-interfaces';
import { ONE } from '@decipad/number';

export function singleUnitRef(unit?: TUnit): string | undefined {
  if (!unit || !unit.exp.equals(ONE) || !unit.multiplier.equals(ONE)) {
    return undefined;
  }
  return unit.unit;
}
