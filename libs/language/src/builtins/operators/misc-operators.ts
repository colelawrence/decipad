import DeciNumber from '@decipad/number';
import { getInstanceof } from '../../utils';
import { DateValue, Range, fromJS, compare } from '../../value';
import { Type, build as t } from '../../type';
import { overloadBuiltin } from '../overloadBuiltin';
import { BuiltinSpec } from '../interfaces';

export const miscOperators: Record<string, BuiltinSpec> = {
  if: {
    argCount: 3,
    fnValues: ([cond, then, otherwise]) => (cond.getData() ? then : otherwise),
    functor: ([cond, then, otherwise]) =>
      Type.combine(cond.isScalar('boolean'), otherwise.sameAs(then)),
  },

  // Range stuff
  contains: overloadBuiltin('contains', 2, [
    {
      argTypes: ['range', 'number'],
      fnValues: ([a, b]) => {
        const [aStart, aEnd] = a.getData() as DeciNumber[];
        const bNumber = b.getData() as DeciNumber;
        return fromJS(
          compare(bNumber, aStart) >= 0 && compare(bNumber, aEnd) <= 0
        );
      },
      functor: ([a, b]): Type =>
        Type.combine(
          a.isRange(),
          b.isScalar('number').sameAs(a.getRangeOf()),
          t.boolean()
        ),
    },
    {
      argTypes: ['date', 'date'],
      fnValues: ([a, b]) => {
        const aVal = getInstanceof(a, DateValue);
        const bVal = getInstanceof(b, DateValue);
        return fromJS(
          aVal.getData() <= bVal.getData() && aVal.getEnd() >= bVal.getEnd()
        );
      },
      functor: ([a, b]) => Type.combine(a.isDate(), b.isDate(), t.boolean()),
    },
    {
      argTypes: ['range', 'date'],
      fnValues: ([rangeV, dateD]) => {
        const { start, end } = getInstanceof(rangeV, Range);
        const startDate = getInstanceof(start, DateValue);
        const endDate = getInstanceof(end, DateValue);
        const date = getInstanceof(dateD, DateValue);

        return fromJS(
          startDate.getData() <= date.getData() &&
            endDate.getData() >= date.getEnd()
        );
      },
      functor: ([range, date]) =>
        Type.combine(range.isRange(), date.isDate(), t.boolean()),
    },
  ]),
};
