import Fraction from '@decipad/fraction';
import { getDefined } from '@decipad/utils';
import { AST, Time, Date as IDate } from '..';
import { getIdentifierString, getOfType } from '../utils';
import { InferError, build as t, Type } from '../type';
import {
  dateToArray,
  getJSDateUnitAndMultiplier,
  cmpSpecificities,
  getSpecificity,
  getTimeUnit,
  getDateFromAstForm,
  dateNodeToTimeUnit,
  sortTimeUnits,
} from '../date';
import { inferExpression } from './index';
import { Context } from './context';

const millisecondsInDay = 24 * 60 * 60 * 1000;

export const getNumberSequenceCount = (
  start: Fraction,
  end: Fraction,
  by: Fraction
): number | InferError => {
  const diff = start.compare(end);
  if (diff === 0) {
    return 1;
  } else if (by.equals(0)) {
    return InferError.sequenceStepZero();
  } else if (Math.sign(diff) === by.compare(0)) {
    return InferError.invalidSequenceStep(
      start.valueOf(),
      end.valueOf(),
      by.valueOf()
    );
  } else if (diff > 0) {
    return getNumberSequenceCount(end, start, by.neg());
  } else {
    return end.sub(start).div(by).add(new Fraction(1)).floor().valueOf();
  }
};

export const getNumberSequenceCountN = (
  start: number | bigint,
  end: number | bigint,
  by: number | bigint
): number | InferError =>
  getNumberSequenceCount(
    new Fraction(start),
    new Fraction(end),
    new Fraction(by)
  );

type SimplerUnit = 'month' | 'day' | 'millisecond';

const toSimpleTimeUnit: Record<string, [SimplerUnit, number]> = {
  year: ['month', 12],
  hour: ['millisecond', 60 * 60 * 1000],
  minute: ['millisecond', 60 * 1000],
  second: ['millisecond', 1000],
};

export const getDateSequenceLength = (
  start: bigint,
  end: bigint,
  boundsSpecificity: Time.Specificity,
  by: Time.Unit
): number | InferError => {
  // Get the end of the year, month or day.
  end = IDate.fromDateAndSpecificity(end, boundsSpecificity).getEnd();

  let [stepUnit, steps] = getJSDateUnitAndMultiplier(by);
  if (start > end) {
    steps = -steps;
  }

  if (stepUnit in toSimpleTimeUnit) {
    const [newUnit, multiplier] = toSimpleTimeUnit[stepUnit];

    stepUnit = newUnit;
    steps *= BigInt(multiplier);
  }

  switch (stepUnit) {
    case 'month': {
      const [startYear, startMonth] = dateToArray(start);
      const [endYear, endMonth] = dateToArray(end);

      const monthDiff = (endYear - startYear) * 12n + (endMonth - startMonth);
      return getNumberSequenceCountN(0, monthDiff, steps);
    }
    case 'day': {
      // Taken from date-fns differenceInCalendarDays

      const differenceInDays = Math.round(
        Number(end - start) / millisecondsInDay
      );

      return getNumberSequenceCountN(0, differenceInDays - 1, steps);
    }
    case 'millisecond': {
      return getNumberSequenceCountN(start, end, steps);
    }
    /* istanbul ignore next */
    default: {
      throw new Error(`panic: unexpected step unit ${stepUnit}`);
    }
  }
};

const tryGetNumber = (n: AST.Expression): Fraction | undefined => {
  if (n.type === 'literal' && n.args[0] === 'number') {
    return n.args[1];
  }
  return undefined;
};

export const getDateSequenceIncrement = (
  byExpr: AST.Expression | void,
  startUnit: Time.Unit,
  endUnit: Time.Unit
) => {
  if (byExpr) {
    return getTimeUnit(getIdentifierString(getOfType('ref', byExpr)));
  }

  return getDefined(sortTimeUnits([startUnit, endUnit]).pop());
};

export const inferSequence = async (
  ctx: Context,
  expr: AST.Sequence
): Promise<Type> => {
  const [startN, endN, byN] = expr.args;
  const startType = await inferExpression(ctx, startN);
  const endType = await inferExpression(ctx, endN);
  const boundTypes = startType.sameAs(endType);

  if (boundTypes.errorCause != null) {
    return boundTypes;
  } else if (startN.type === 'date' && endN.type === 'date') {
    const [start, startSpec] = getDateFromAstForm(startN.args);
    const [end] = getDateFromAstForm(endN.args);
    const boundsSpecificity = getSpecificity(startSpec);

    let increment;
    let specificity;

    try {
      increment = getDateSequenceIncrement(
        byN,
        dateNodeToTimeUnit(startN.args),
        dateNodeToTimeUnit(endN.args)
      );
      specificity = getSpecificity(increment);
    } catch {
      return t.impossible('Invalid increment clause in date sequence');
    }

    if (cmpSpecificities(specificity, boundsSpecificity) < 0) {
      return t.impossible(`An increment clause of ${increment} is too broad`);
    }

    const countOrError = getDateSequenceLength(
      start,
      end,
      boundsSpecificity,
      increment
    );

    return countOrError instanceof InferError
      ? t.impossible(countOrError)
      : t.column(t.date(specificity), countOrError);
  } else {
    const type = startType.isScalar('number');
    if (type.errorCause) {
      return type;
    }
    const start = tryGetNumber(startN);
    const end = tryGetNumber(endN);

    if (start && end) {
      const by = byN
        ? tryGetNumber(byN)
        : start.compare(end) < 0
        ? new Fraction(1n)
        : new Fraction(-1n);
      if (by) {
        const countOrError = getNumberSequenceCount(start, end, by);
        return countOrError instanceof InferError
          ? t.impossible(countOrError)
          : t.column(boundTypes, countOrError);
      }
    }
    return t.column(boundTypes, 'unknown');
  }
};
