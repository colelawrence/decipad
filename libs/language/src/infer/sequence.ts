import { AST, Time, Date as IDate } from '..';
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

export const getDateSequenceLength = (
  start: number,
  end: number,
  boundsSpecificity: Time.Specificity,
  by: Time.Unit
): number | string => {
  // Get the end of the year, month or day.
  end = IDate.fromDateAndSpecificity(end, boundsSpecificity).getEnd();

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

      return getNumberSequenceCount(0, differenceInDays - 1, steps);
    }
    case 'millisecond': {
      return getNumberSequenceCount(start, end, steps);
    }
    /* istanbul ignore next */
    default: {
      throw new Error(`panic: unexpected step unit ${stepUnit}`);
    }
  }
};

export const inferSequence = async (ctx: Context, expr: AST.Sequence) => {
  const [startN, endN, byN] = expr.args;
  const boundTypes = (await inferExpression(ctx, startN)).sameAs(
    await inferExpression(ctx, endN)
  );

  if (boundTypes.errorCause != null) {
    return boundTypes;
  } else if (startN.type === 'date' && endN.type === 'date') {
    let increment;
    let specificity;

    try {
      increment = getTimeUnit(getOfType('ref', byN).args[0]);
      specificity = getSpecificity(increment);
    } catch {
      return t.impossible('Invalid increment clause in date sequence');
    }

    const [start, startSpec] = getDateFromAstForm(startN.args);
    const [end] = getDateFromAstForm(endN.args);
    const boundsSpecificity = getSpecificity(startSpec);

    if (cmpSpecificities(specificity, boundsSpecificity) < 0) {
      return t.impossible(`An increment clause of ${increment} is too broad`);
    }

    const countOrError = getDateSequenceLength(
      start,
      end,
      boundsSpecificity,
      increment
    );

    return typeof countOrError === 'string'
      ? t.impossible(countOrError)
      : t.column(t.date(specificity), countOrError);
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
      : t.column(boundTypes, countOrError);
  } else {
    return t.impossible('Sequence parameters must be literal');
  }
};
