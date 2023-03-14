import DeciNumber, { N, ONE, ZERO } from '@decipad/number';
import { getDefined } from '@decipad/utils';
import { AST, Time, DateValue } from '..';
import { getIdentifierString, getOfType } from '../utils';
import { InferError, buildType as t, Type } from '../type';
import {
  dateToArray,
  getJSDateUnitAndMultiplier,
  getSpecificity,
  getTimeUnit,
  getDateFromAstForm,
  dateNodeToTimeUnit,
  sortTimeUnits,
} from '../date';
import { Context } from './context';

const millisecondsInDay = 24 * 60 * 60 * 1000;

export const getNumberSequenceError = (
  start: DeciNumber,
  end: DeciNumber,
  by: DeciNumber
): InferError | undefined => {
  const diff = start.compare(end);
  if (diff === 0) {
    return undefined;
  } else if (by.equals(ZERO)) {
    return InferError.sequenceStepZero();
  } else if (Math.sign(diff) === by.compare(ZERO)) {
    return InferError.invalidSequenceStep(
      start.valueOf(),
      end.valueOf(),
      by.valueOf()
    );
  } else if (diff > 0) {
    return getNumberSequenceError(end, start, by.neg());
  } else {
    return undefined;
  }
};

export const getNumberSequenceErrorN = (
  start: number | bigint,
  end: number | bigint,
  by: number | bigint
): InferError | undefined => getNumberSequenceError(N(start), N(end), N(by));

type SimplerUnit = 'month' | 'day' | 'millisecond';

const toSimpleTimeUnit: Record<string, [SimplerUnit, number]> = {
  year: ['month', 12],
  quarter: ['month', 3],
  hour: ['millisecond', 60 * 60 * 1000],
  minute: ['millisecond', 60 * 1000],
  second: ['millisecond', 1000],
};

export const getDateSequenceError = (
  start: bigint,
  end: bigint,
  boundsSpecificity: Time.Specificity,
  by: Time.Unit
): InferError | undefined => {
  // Get the end of the year, month or day.
  end = DateValue.fromDateAndSpecificity(end, boundsSpecificity).getEnd();

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
      return getNumberSequenceErrorN(0, monthDiff, steps);
    }
    case 'day': {
      // Taken from date-fns differenceInCalendarDays

      const differenceInDays = Math.round(
        Number(end - start) / millisecondsInDay
      );

      return getNumberSequenceErrorN(0, differenceInDays - 1, steps);
    }
    case 'millisecond': {
      return getNumberSequenceErrorN(start, end, steps);
    }
    /* istanbul ignore next */
    default: {
      throw new Error(`panic: unexpected step unit ${stepUnit}`);
    }
  }
};

const tryGetNumber = (n: AST.Expression): DeciNumber | undefined => {
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

export const inferSequence = (
  ctx: Context,
  expr: AST.Sequence,
  inferExpression: (ctx: Context, expr: AST.Expression) => Type
): Type => {
  const [startN, endN, byN] = expr.args;
  const startType = inferExpression(ctx, startN);
  const endType = inferExpression(ctx, endN);
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

    const countOrError = getDateSequenceError(
      start,
      end,
      boundsSpecificity,
      increment
    );

    return countOrError
      ? t.impossible(countOrError)
      : t.column(t.date(specificity));
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
        ? ONE
        : N(-1n);
      if (by) {
        const countOrError = getNumberSequenceError(start, end, by);
        return countOrError instanceof InferError
          ? t.impossible(countOrError)
          : t.column(boundTypes, countOrError);
      }
    }
    return t.column(boundTypes, 'unknown');
  }
};
