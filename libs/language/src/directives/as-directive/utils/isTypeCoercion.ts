import { Unit as TUnit } from '@decipad/language-interfaces';
import { isTypeCoercionTarget } from '../../../type-coercion';
import { singleUnitRef } from './singleUnitRef';

export function isTypeCoercion(units: TUnit[]): boolean {
  if (units.length !== 1) {
    return false;
  }
  const [unit] = units;
  const ref = singleUnitRef(unit);
  if (!ref) {
    return false;
  }
  return isTypeCoercionTarget(ref);
}
