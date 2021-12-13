import { Date, fromJS } from '../../interpreter/Value';
import { getInstanceof } from '../../utils';
import { BuiltinSpec } from '../interfaces';
import { Type, build as t } from '../../type';

const dateCmpFunctor = ([left, right]: Type[]): Type =>
  Type.combine(left.isDate(), right.sameAs(left), t.boolean());

export const dateOperators: Record<string, BuiltinSpec> = {
  containsdate: {
    argCount: 2,
    fnValues: (range, date) => {
      const [rStart, rEnd] = range.getData() as number[];
      const dateVal = getInstanceof(date, Date);
      return fromJS(rStart <= dateVal.getData() && rEnd >= dateVal.getEnd());
    },
    functor: ([a, b]) =>
      Type.combine(a.getRangeOf().isDate(), b.isDate(), t.boolean()),
  },
  // Date stuff (TODO operator overloading)
  dateequals: {
    argCount: 2,
    fn: (date1, date2) => date1 === date2,
    functor: dateCmpFunctor,
  },
  dategte: {
    argCount: 2,
    fn: (date1, date2) => date1 >= date2,
    functor: dateCmpFunctor,
  },
};
