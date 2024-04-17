import type DeciNumber from '@decipad/number';
import { N, ONE, ZERO } from '@decipad/number';
import { getDefined } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import type { Type, AST } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  InferError,
  typeIsPending,
  buildType as t,
  Time,
  Value,
} from '@decipad/language-types';
import { getIdentifierString } from '../utils';
import { getJSDateUnitAndMultiplier, sortTimeUnits } from '../date';
import { getOfType } from '../parser/getOfType';
import type { TRealm } from '../scopedRealm';

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

export const getDateSequenceError = async (
  start: bigint | undefined,
  _end: bigint | undefined,
  boundsSpecificity: Time.Specificity,
  by: Time.TimeUnit
): Promise<InferError | undefined> => {
  if (start == null) {
    return new InferError('No start date');
  }
  if (_end == null) {
    return new InferError('No end date');
  }
  // Get the end of the year, month or day.
  const end = getDefined(
    Value.DateValue.fromDateAndSpecificity(_end, boundsSpecificity).getEnd()
  );

  const dateUnitAndMultiplier = getJSDateUnitAndMultiplier(by);
  if (!dateUnitAndMultiplier) {
    return new InferError('undefined date');
  }
  let [stepUnit, steps] = dateUnitAndMultiplier;
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
      const [startYear, startMonth] = Time.dateToArray(start);
      const [endYear, endMonth] = Time.dateToArray(end);

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
  startUnit: Time.TimeUnit,
  endUnit: Time.TimeUnit
) => {
  if (byExpr) {
    return Time.getTimeUnit(getIdentifierString(getOfType('ref', byExpr)));
  }

  return getDefined(sortTimeUnits([startUnit, endUnit]).pop());
};

// eslint-disable-next-line complexity
export const inferSequence = async (
  realm: TRealm,
  expr: AST.Sequence,
  inferExpression: (realm: TRealm, expr: AST.Expression) => Promise<Type>
): Promise<Type> => {
  const [startN, endN, byN] = expr.args;
  const startType = await inferExpression(realm, startN);
  const endType = await inferExpression(realm, endN);

  // pending is contagious
  const pending = [startType, endType].find(typeIsPending);
  if (pending) {
    return pending;
  }
  const boundTypes = await startType.sameAs(endType);

  if (boundTypes.errorCause != null) {
    return boundTypes;
  } else if (boundTypes.date) {
    let increment;
    let specificity;

    try {
      increment = getDateSequenceIncrement(
        byN,
        boundTypes.date,
        boundTypes.date
      );
      specificity = Time.getSpecificity(increment);
    } catch {
      return t.impossible('Invalid increment clause in date sequence');
    }

    return t.column(t.date(specificity));
  } else {
    const type = await startType.isScalar('number');
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
    return t.column(boundTypes);
  }
};
