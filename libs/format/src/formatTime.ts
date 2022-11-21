import FFraction, { ONE, toFraction } from '@decipad/fraction';
import {
  areUnitsConvertible,
  convertBetweenUnits,
  normalizeUnitName,
  parseUnit,
  Unit,
} from '@decipad/language';
import pluralize from 'pluralize';
import { IntermediateDeciNumber, formatAnyUnit } from './formatNumber';
import { Options, prettifyTimeMs as getPrettyPartsOfTime } from './parseMs';

const ms = [parseUnit('millisecond')] as Unit[];

export function fromTimeUnitToTimeBase(
  unit: Unit[],
  n: FFraction
): [FFraction, boolean] {
  const unitLargerThanDay =
    unit[0].baseQuantity === 'month' ||
    normalizeUnitName(unit[0].unit) === 'week';
  if (unitLargerThanDay) {
    return [n, false];
  }
  if (areUnitsConvertible(unit, ms)) {
    return [convertBetweenUnits(n, unit, ms), true];
  }
  throw new Error('Invalid conversion to non time unit');
}

export function formatTime(
  locale: string,
  units: Unit[],
  n: FFraction,
  args: Partial<Options> = {}
): IntermediateDeciNumber {
  const [inMsTF, simplify] = fromTimeUnitToTimeBase(units, n);
  const value = inMsTF.valueOf();

  const unitStr = pluralize(units[0].unit, n.valueOf());
  const asStringPrecise = `${n.valueOf()} ${unitStr}`;

  if (!simplify || value === 0) {
    return {
      ...formatAnyUnit(locale, units, n),
      asStringPrecise,
    };
  }
  return {
    asStringPrecise,
    isPrecise: true,
    partsOf: getPrettyPartsOfTime(
      value,
      value < 1 ? { ...args, formatSubTime: true, verbose: false } : args
    ),
    value: inMsTF.div(1000).valueOf(),
  };
}

export function isTimeUnit(units: Unit[]): boolean {
  const unit = units[0];
  return (
    units?.length === 1 &&
    unit != null &&
    (unit.baseQuantity === 'second' || unit.baseQuantity === 'month') &&
    toFraction(unit.exp).equals(ONE)
  );
}
