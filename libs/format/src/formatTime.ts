import FFraction, { ONE } from '@decipad/fraction';
import {
  areUnitsConvertible,
  convertBetweenUnits,
  parseUnit,
  Unit,
} from '@decipad/language';
import pluralize from 'pluralize';
import { IntermediateDeciNumber } from './formatNumber';
import { Options, prettyPartsOf } from './parseMs';

const ms = [parseUnit('millisecond')] as Unit[];
const month = [parseUnit('month')] as Unit[];

export function fromTimeUnitToTimeBase(
  unit: Unit[],
  n: FFraction
): [Unit[] | null, FFraction] {
  if (areUnitsConvertible(unit, ms)) {
    return [ms, convertBetweenUnits(n, unit, ms)];
  }
  if (areUnitsConvertible(unit, month)) {
    return [month, convertBetweenUnits(n, unit, month)];
  }
  return [null, n];
}

export function formatTime(
  _locale: string,
  units: Unit[],
  n: FFraction,
  args: Partial<Options> = {}
): IntermediateDeciNumber {
  const [base, inMsTF] = fromTimeUnitToTimeBase(units, n);
  const value = inMsTF.valueOf();
  const unitAsString = pluralize(units[0].unit, n.valueOf());

  if (base === null) {
    throw new Error('Invalid conversion to non time unit');
  }

  const isPrecise = value < 1;

  const baseOps = {
    ...args,
    ...(isPrecise ? { formatSubTime: true, verbose: false } : {}),
    base: base[0].unit === 'millisecond' ? 'millisecond' : 'month',
  } as Options;
  const partsOf = prettyPartsOf(value, baseOps);

  return {
    asStringPrecise: `${n.valueOf()} ${unitAsString}`,
    isPrecise,
    partsOf,
    value:
      base[0].unit === 'millisecond'
        ? value !== 0
          ? inMsTF.div(1000).valueOf()
          : value
        : value,
  };
}

export function isTimeUnit(units: Unit[]): boolean {
  const unit = units[0];
  return (
    units?.length === 1 &&
    unit != null &&
    (unit.baseQuantity === 'second' || unit.baseQuantity === 'month') &&
    new FFraction(unit.exp).equals(ONE)
  );
}
