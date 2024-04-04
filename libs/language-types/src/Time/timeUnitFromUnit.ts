import type * as Time from './Time';
import type { Unit } from '@decipad/language-units';
// eslint-disable-next-line no-restricted-imports
import { singular } from '@decipad/language-utils';
import { timeUnits } from './timeUnits';

export const timeUnitFromUnit = (unit: Unit.Unit | string): Time.TimeUnit => {
  const u = singular((unit as Unit.Unit).unit ?? unit);
  if (!timeUnits.has(u)) {
    throw new Error(`Expected time unit and got ${u}`);
  }
  return u as Time.TimeUnit;
};
