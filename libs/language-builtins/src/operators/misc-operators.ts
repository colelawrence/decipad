import DeciNumber from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { Type, Value, compare, buildType as t } from '@decipad/language-types';
import { overloadBuiltin } from '../overloadBuiltin';
import { BuiltinSpec } from '../interfaces';
import { getDefined, getInstanceof } from '@decipad/utils';

const extractDateValues = async (a: Value.Value) => {
  const aVal = getInstanceof(a, Value.DateValue);
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
          return Value.fromJS(
            compare(bNumber, aStart) >= 0 && compare(bNumber, aEnd) <= 0,
            Value.defaultValue('boolean')
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
            return Value.fromJS(false, Value.defaultValue('boolean'));
          }

          return Value.fromJS(
            aDate <= bDate && getDefined(aEndDate) >= getDefined(bEndDate),
            Value.defaultValue('boolean')
          );
        },
        functor: async ([a, b]) =>
          Type.combine(a.isDate(), b.isDate(), t.boolean()),
      },
      {
        argTypes: ['range', 'date'],
        fnValues: async ([rangeV, dateD]) => {
          const { start, end } = getInstanceof(rangeV, Value.Range);
          const [[startDate], [endDate]] = await Promise.all(
            [start, end].map(extractDateValues)
          );
          const [dateStart, dateEnd] = await extractDateValues(dateD);
          if (!startDate || !endDate || !dateStart || !dateEnd) {
            return Value.fromJS(false, Value.defaultValue('boolean'));
          }

          return Value.fromJS(
            startDate <= dateStart && endDate >= dateEnd,
            Value.defaultValue('boolean')
          );
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
    fnValues: () => new Value.NumberValue(1),
    noAutoconvert: true,
    functor: ([expression]) => expression,
    explanation: 'Returns the unit from an expression',
    example: 'getunit(5 minutes)',
    syntax: 'getunit(Number with unit)',
    formulaGroup: 'Units',
  },
};
