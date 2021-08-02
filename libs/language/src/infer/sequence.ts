import { AST, Time } from '..';
import { getOfType } from '../utils';
import { build as t } from '../type';
import {
  dateToArray,
  getJSDateUnitAndMultiplier,
  cmpSpecificities,
  getSpecificity,
  getTimeUnit,
  getDateFromAstForm,
} from '../date';
import { inferExpression } from './index';
import { Context } from './context';

export const getNumberSequenceCountBigInt = (
  start: bigint,
  end: bigint,
  by: bigint
): number | string => {
  if (start === end) {
    return 1;
  } else if (start > end) {
    return getNumberSequenceCountBigInt(end, start, -by);
  } else if (by === BigInt(0)) {
    return 'Sequence interval must not be zero';
  } else if (by < 0) {
    return 'Divergent sequence';
  } else {
    const divided = (end - start) / by;

    return Number(divided) + 1;
  }
};

export const getNumberSequenceCount = (
  start: number,
  end: number,
  by: number
): number | string =>
  getNumberSequenceCountBigInt(BigInt(start), BigInt(end), BigInt(by));

type SimplerUnit = 'month' | 'day' | 'millisecond';

const toSimpleTimeUnit: Record<string, [SimplerUnit, number]> = {
  year: ['month', 12],
  hour: ['millisecond', 60 * 60 * 1000],
  minute: ['millisecond', 60 * 1000],
  second: ['millisecond', 1000],
};

export const getDateSequenceCount = (
  start: number,
  end: number,
  by: Time.Unit
): number | string => {
  let [stepUnit, steps] = getJSDateUnitAndMultiplier(by);

  if (stepUnit in toSimpleTimeUnit) {
    const [newUnit, multiplier] = toSimpleTimeUnit[stepUnit];

    stepUnit = newUnit;
    steps *= multiplier;
  }

  switch (stepUnit) {
    case 'month': {
      const [startYear, startMonth] = dateToArray(start);
      const [endYear, endMonth] = dateToArray(end);

      const monthDiff = (endYear - startYear) * 12 + (endMonth - startMonth);
      return getNumberSequenceCount(0, monthDiff, steps);
    }
    case 'day': {
      // Taken from date-fns differenceInCalendarDays
      const millisecondsInDay = 24 * 60 * 60 * 1000;

      const differenceInDays = Math.round((end - start) / millisecondsInDay);

      return getNumberSequenceCount(0, differenceInDays, steps);
    }
    case 'millisecond': {
      return getNumberSequenceCount(start, end, steps);
    }
    /* istanbul ignore next */
    default: {
      throw new Error('panic: unexpected step unit ' + stepUnit);
    }
  }
};

export const inferSequence = async (ctx: Context, expr: AST.Sequence) => {
  const [startN, endN, byN] = expr.args;
  const itemType = (await inferExpression(ctx, startN)).sameAs(
    await inferExpression(ctx, endN)
  );

  if (itemType.errorCause != null) {
    return itemType;
  } else if (startN.type === 'date' && endN.type === 'date') {
    let increment;
    try {
      increment = getOfType('ref', byN).args[0];
      getSpecificity(increment);
    } catch {
      return t.impossible('Invalid increment clause in date sequence');
    }

    const [start, startSpec] = getDateFromAstForm(startN.args);
    const [end, endSpec] = getDateFromAstForm(endN.args);

    if (
      cmpSpecificities(getSpecificity(increment), startSpec) !== 0 ||
      cmpSpecificities(startSpec, endSpec) !== 0
    ) {
      return t.impossible('Mismatched specificities in date sequence');
    }

    const countOrError = getDateSequenceCount(
      start,
      end,
      getTimeUnit(increment)
    );

    return typeof countOrError === 'string'
      ? t.impossible(countOrError)
      : t.column(itemType, countOrError);
  } else if (
    expr.args.every(
      (n) =>
        n.type === 'literal' &&
        n.args[0] === 'number' &&
        typeof n.args[1] === 'number'
    )
  ) {
    const countOrError = getNumberSequenceCount(
      startN.args[1] as number,
      endN.args[1] as number,
      byN.args[1] as number
    );

    return typeof countOrError === 'string'
      ? t.impossible(countOrError)
      : t.column(itemType, countOrError);
  } else {
    return t.impossible('Sequence parameters must be literal');
  }
};
