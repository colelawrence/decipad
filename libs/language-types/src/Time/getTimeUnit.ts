import type { TimeUnit } from './Time';
import { timeUnitToJSDateUnit } from './timeUnitToJsDateUnit';

export const getTimeUnit = (thing: string): TimeUnit => {
  if (thing in timeUnitToJSDateUnit) {
    return thing as TimeUnit;
  } else {
    throw new Error(`panic: Expected Time.Unit, got ${thing}`);
  }
};
