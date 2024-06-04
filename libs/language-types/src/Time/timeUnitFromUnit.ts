import type * as Time from './Time';
import type { Unit } from '@decipad/language-interfaces';
import { singular } from '@decipad/language-units';
import { timeUnits } from './timeUnits';

export const timeUnitFromUnit = (unit: Unit | string): Time.TimeUnit => {
  const u = singular((unit as Unit).unit ?? unit);
  if (!timeUnits.has(u)) {
    throw new Error(`Expected time unit and got ${u}`);
  }
  return u as Time.TimeUnit;
};
