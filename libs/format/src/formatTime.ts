import DeciNumber, { ONE, N } from '@decipad/number';
import {
  areUnitsConvertible,
  convertBetweenUnits,
  normalizeUnitName,
  parseUnit,
  Unit,
} from '@decipad/language';
import pluralize from 'pluralize';

import { Options, prettifyTimeMs as getPrettyPartsOfTime } from './parseMs';
import type { IntermediateDeciNumber } from './formatNumber';

import { once } from '@decipad/utils';

const ms = once(() => [parseUnit('millisecond')] as Unit[]);

export function fromTimeUnitToTimeBase(
  unit: Unit[],
  n: DeciNumber
): [DeciNumber, boolean] {
  const [firstUnit] = unit;
  const unitLargerThanDay =
    firstUnit.baseQuantity === 'month' ||
    firstUnit.baseQuantity === 'year' ||
    normalizeUnitName(firstUnit.unit) === 'week';
  if (unitLargerThanDay) {
    return [n, false];
  }
  if (areUnitsConvertible(unit, ms())) {
    return [convertBetweenUnits(n, unit, ms()), true];
  }
  throw new Error('Invalid conversion to non time unit');
}

export function formatTime(
  locale: string,
  units: Unit[],
  n: DeciNumber,
  args: Partial<Options>,
  formatAnyUnit: (
    loc: string,
    un: Unit[],
    nu: DeciNumber
  ) => IntermediateDeciNumber
): IntermediateDeciNumber {
  const [inMsTF, simplify] = fromTimeUnitToTimeBase(units, n);
  const value = inMsTF.valueOf();

  const unitStr = pluralize(units[0].unit, n.valueOf());
  const asStringPrecise = `${n.valueOf()} ${unitStr}`;

  if (!simplify || value === 0) {
    return {
      ...formatAnyUnit(locale, units, n),
      formatOptions: null,
      asStringPrecise,
    };
  }
  return {
    asStringPrecise,
    formatOptions: null,
    isPrecise: true,
    partsOf: getPrettyPartsOfTime(
      value,
      value < 1 ? { ...args, formatSubTime: true, verbose: false } : args
    ),
    value: inMsTF.div(N(1000)).valueOf(),
  };
}

export function isTimeUnit(units: Unit[]): boolean {
  const unit = units[0];
  return (
    units?.length === 1 &&
    unit != null &&
    (unit.baseQuantity === 'second' || unit.baseQuantity === 'month') &&
    N(unit.exp).equals(ONE)
  );
}
