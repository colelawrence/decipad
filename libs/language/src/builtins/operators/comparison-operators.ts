import { BuiltinSpec } from '../interfaces';
import { Type, buildType as t, InferError } from '../../type';
import { compare } from '../../compare';

const cmpFunctor = ([left, right]: Type[]): Type => {
  if (left.type === 'boolean') {
    return t.impossible(InferError.expectedButGot('number', left));
  }
  return Type.combine(right.sameAs(left), t.boolean());
};

export const comparisonOperators: Record<string, BuiltinSpec> = {
  '<': {
    argCount: 2,
    fn: ([a, b]) => compare(a, b) < 0,
    functor: cmpFunctor,
    operatorKind: 'infix',
  },
  '>': {
    argCount: 2,
    fn: ([a, b]) => compare(a, b) > 0,
    functor: cmpFunctor,
    operatorKind: 'infix',
  },
  '<=': {
    argCount: 2,
    fn: ([a, b]) => compare(a, b) <= 0,
    functor: cmpFunctor,
    operatorKind: 'infix',
  },
  '>=': {
    argCount: 2,
    fn: ([a, b]) => compare(a, b) >= 0,
    functor: cmpFunctor,
    operatorKind: 'infix',
  },
};
