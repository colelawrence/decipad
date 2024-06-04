import { singular } from 'pluralize';
import type { Unit } from '@decipad/language-interfaces';
import type { TimeUnit } from './Time';
import { getTimeUnit } from './getTimeUnit';
import { RuntimeError } from '../RuntimeError';

export function timeUnitFromUnits(units: Unit[]): TimeUnit {
  if (units.length !== 1) {
    throw new RuntimeError(
      'Cannot construct time quantity from more than one unit of time'
    );
  }
  const unit = singular(units[0].unit);
  return getTimeUnit(unit);
}
