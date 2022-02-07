import { BuiltinSpec } from '../interfaces';
import { Type, build as t } from '../../type';
import { compare } from '../../interpreter/compare-values';

const cmpFunctor = ([left, right]: Type[]): Type =>
  Type.combine(right.sameAs(left), t.boolean());

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isEqual = (a: any, b: any) => {
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return a === b;
  }
  return compare(a, b) === 0;
};

export const equalityOperators: Record<string, BuiltinSpec> = {
  '==': {
    argCount: 2,
    fn: ([a, b]) => isEqual(a, b),
    functor: cmpFunctor,
  },
  '!=': {
    argCount: 2,
    fn: ([a, b]) => !isEqual(a, b),
    functor: cmpFunctor,
  },
};
