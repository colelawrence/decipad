import { BuiltinSpec } from '../interfaces';
import { Type, build as t } from '../../type';

const booleanBinopFunctor = ([left, right]: Type[]): Type =>
  Type.combine(
    left.isScalar('boolean'),
    right.isScalar('boolean'),
    t.boolean()
  );

export const booleanOperators: Record<string, BuiltinSpec> = {
  '!': {
    argCount: 1,
    fn: ([a]) => !a,
    functor: ([a]) => a.isScalar('boolean'),
  },
  not: {
    aliasFor: '!',
  },
  '&&': {
    argCount: 2,
    fn: ([a, b]) => a && b,
    functor: booleanBinopFunctor,
  },
  and: {
    aliasFor: '&&',
  },
  '||': {
    argCount: 2,
    fn: ([a, b]) => a || b,
    functor: booleanBinopFunctor,
  },
  or: {
    aliasFor: '||',
  },
};
