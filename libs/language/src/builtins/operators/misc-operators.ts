import Fraction from '@decipad/fraction';
import { getInstanceof } from '../../utils';
import { Date, fromJS } from '../../interpreter/Value';
import { Type, build as t } from '../../type';
import { overloadBuiltin } from '../overloadBuiltin';
import { BuiltinSpec } from '../interfaces';
import { compare } from '../../interpreter/compare-values';

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
        const [aStart, aEnd] = a.getData() as Fraction[];
        const bNumber = b.getData() as Fraction;
        return fromJS(
          compare(bNumber, aStart) >= 0 && compare(bNumber, aEnd) <= 0
        );
      },
      functor: ([a, b]): Type =>
        Type.combine(
          a.isRange(),
          b.isScalar('number').noUnitsOrSameUnitsAs(a.getRangeOf()),
          t.boolean()
        ),
    },
    {
      argTypes: ['date', 'date'],
      fnValues: ([a, b]) => {
        const aVal = getInstanceof(a, Date);
        const bVal = getInstanceof(b, Date);
        return fromJS(
          aVal.getData() <= bVal.getData() && aVal.getEnd() >= bVal.getEnd()
        );
      },
      functor: ([a, b]) => Type.combine(a.isDate(), b.isDate(), t.boolean()),
    },
  ]),
};
