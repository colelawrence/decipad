import DeciNumber from '@decipad/number';
import { getDefined, getInstanceof } from '../../utils';
import { DateValue, Range, fromJS, NumberValue, Value } from '../../value';
import { Type, buildType as t } from '../../type';
import { overloadBuiltin } from '../overloadBuiltin';
import { BuiltinSpec } from '../interfaces';
import { compare } from '../../compare';

const extractDateValues = async (a: Value) => {
  const aVal = getInstanceof(a, DateValue);
  return [await aVal.getData(), await aVal.getEnd()];
};

export const miscOperators: Record<string, BuiltinSpec> = {
  if: {
    argCount: 3,
    fnValues: async ([cond, then, otherwise]) =>
      (await cond.getData()) ? then : otherwise,
    functor: async ([cond, then, otherwise]) =>
      Type.combine(cond.isScalar('boolean'), otherwise.sameAs(then)),
    explanation: 'Select a result based on a condition.',
    formulaGroup: 'Conditions',
    syntax: 'if ...Condition then ...ResultTrue else ...ResultFalse',
    example: 'if Sales > $5000 then 5% else 10%',
  },

  // Range stuff
  contains: {
    ...overloadBuiltin('contains', 2, [
      {
        argTypes: ['range', 'number'],
        fnValues: async ([a, b]) => {
          const [aStart, aEnd] = (await a.getData()) as DeciNumber[];
          const bNumber = getInstanceof(await b.getData(), DeciNumber);
          return fromJS(
            compare(bNumber, aStart) >= 0 && compare(bNumber, aEnd) <= 0
          );
        },
        functor: async ([a, b]) =>
          Type.combine(
            a.isRange(),
            (await b.isScalar('number')).sameAs(a.getRangeOf()),
            t.boolean()
          ),
      },
      {
        argTypes: ['date', 'date'],
        fnValues: async ([a, b]) => {
          const [[aDate, aEndDate], [bDate, bEndDate]] = await Promise.all(
            [a, b].map(extractDateValues)
          );
          if (aDate == null || bDate == null) {
            return fromJS(false);
          }

          return fromJS(
            aDate <= bDate && getDefined(aEndDate) >= getDefined(bEndDate)
          );
        },
        functor: async ([a, b]) =>
          Type.combine(a.isDate(), b.isDate(), t.boolean()),
      },
      {
        argTypes: ['range', 'date'],
        fnValues: async ([rangeV, dateD]) => {
          const { start, end } = getInstanceof(rangeV, Range);
          const [[startDate], [endDate]] = await Promise.all(
            [start, end].map(extractDateValues)
          );
          const [dateStart, dateEnd] = await extractDateValues(dateD);
          if (!startDate || !endDate || !dateStart || !dateEnd) {
            return fromJS(false);
          }

          return fromJS(startDate <= dateStart && endDate >= dateEnd);
        },
        functor: async ([range, date]) =>
          Type.combine(range.isRange(), date.isDate(), t.boolean()),
      },
    ]),
    explanation: 'Check whether a range contains a value.',
    syntax: '[Range] contains [Value]',
    example: 'Runway contains NextYear',
    formulaGroup: 'Ranges',
  },
  stripunit: {
    argCount: 1,
    fnValues: ([expression]) => expression,
    noAutoconvert: true,
    functor: async ([expression]) =>
      (await expression.isScalar('number')).mapType(() => t.number()),
    explanation: 'Removes the unit from an expression.',
    example: 'stripunit(5 minutes)',
    syntax: 'stripunit(Number with unit)',
    formulaGroup: 'Units',
  },
  getunit: {
    argCount: 1,
    fnValues: () => new NumberValue(1),
    noAutoconvert: true,
    functor: ([expression]) => expression,
    explanation: 'Returns the unit from an expression',
    example: 'getunit(5 minutes)',
    syntax: 'getunit(Number with unit)',
    formulaGroup: 'Units',
  },
};
