import { getInstanceof } from '../../utils';
import { Date, fromJS } from '../../interpreter/Value';
import { Type, build as t } from '../../type';
import { overloadBuiltin } from '../overloadBuiltin';
import { BuiltinSpec } from '../interfaces';

export const miscOperators: Record<string, BuiltinSpec> = {
  if: {
    argCount: 3,
    fn: (a, b, c) => (a ? b : c),
    functor: ([a, b, c]) => Type.combine(a.isScalar('boolean'), c.sameAs(b)),
  },

  // Range stuff
  contains: overloadBuiltin('contains', 2, [
    {
      argTypes: ['number', 'number'],
      fnValues: (a, b) => {
        const [aStart, aEnd] = a.getData() as number[];
        const bNumber = b.getData() as number;
        return fromJS(bNumber >= aStart && bNumber <= aEnd);
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
      fnValues: (a, b) => {
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
