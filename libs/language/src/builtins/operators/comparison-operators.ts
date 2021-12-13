import { BuiltinSpec } from '../interfaces';
import { Type, build as t } from '../../type';
import { compare } from '../../interpreter/compare-values';

const cmpFunctor = ([left, right]: Type[]): Type =>
  Type.combine(right.sameAs(left), t.boolean());

export const comparisonOperators: Record<string, BuiltinSpec> = {
  '<': {
    argCount: 2,
    fn: (a, b) => compare(a, b) < 0,
    functor: cmpFunctor,
  },
  '>': {
    argCount: 2,
    fn: (a, b) => compare(a, b) > 0,
    functor: cmpFunctor,
  },
  '<=': {
    argCount: 2,
    fn: (a, b) => compare(a, b) <= 0,
    functor: cmpFunctor,
  },
  '>=': {
    argCount: 2,
    fn: (a, b) => compare(a, b) >= 0,
    functor: cmpFunctor,
  },
  '==': {
    argCount: 2,
    fn: (a, b) => compare(a, b) === 0,
    functor: cmpFunctor,
  },
  '!=': {
    argCount: 2,
    fn: (a, b) => compare(a, b) !== 0,
    functor: cmpFunctor,
  },
};
