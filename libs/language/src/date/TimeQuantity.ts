/* eslint-disable no-underscore-dangle */
import { singular } from 'pluralize';
import { Time, Units } from '..';
import { RuntimeError } from '../interpreter';
import { getDefined } from '../utils';
import { sortTimeUnits, timeUnitFromUnit } from '.';

type TimeUnitInit = Map<Time.Unit, bigint> | Partial<Record<Time.Unit, bigint>>;

export class TimeQuantity {
  timeUnits = new Map<Time.Unit, bigint>();

  constructor(timeUnits: TimeUnitInit) {
    this.timeUnits = toTimeUnitMap(timeUnits);
  }

  static fromUnits(number: bigint, units: Units): TimeQuantity {
    if (units.args.length !== 1) {
      throw new RuntimeError(
        'Cannot construct time quantity from more than one unit of time'
      );
    }
    const unit = singular(units.args[0].unit);
    return new TimeQuantity({ [unit]: number });
  }
}

function toTimeUnitMap(timeUnits: TimeUnitInit) {
  const ret = new Map();

  const entries =
    timeUnits instanceof Map
      ? timeUnits.entries()
      : (Object.entries(timeUnits) as Iterable<[Time.Unit, bigint]>);

  const unsorted = new Map(entries);
  for (const unit of sortTimeUnits(unsorted.keys())) {
    ret.set(timeUnitFromUnit(unit), getDefined(unsorted.get(unit)));
  }

  return ret;
}
