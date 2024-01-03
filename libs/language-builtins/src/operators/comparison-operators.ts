// eslint-disable-next-line no-restricted-imports
import {
  Type,
  InferError,
  buildType as t,
  compare,
} from '@decipad/language-types';
import { BuiltinSpec } from '../interfaces';

const cmpFunctor = async ([left, right]: Type[]) => {
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
