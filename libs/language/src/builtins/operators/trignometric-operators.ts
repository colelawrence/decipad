import { N } from '@decipad/number';
import { once } from 'ramda';
import { Type, build as t } from '../../type';
import { BuiltinSpec } from '../interfaces';

const radian = once(() =>
  t.number([
    {
      unit: 'radian',
      exp: N(1),
      multiplier: N(1),
      known: true,
    },
  ])
);

const angleOpFunctor = ([n]: Type[]) =>
  n
    .isScalar('number')
    .sameAs(radian())
    .mapType(() => t.number());

const arcFunctor = ([n]: Type[]) =>
  n.isScalar('number').mapType(() => radian());

export const trignometricOperators: Record<string, BuiltinSpec> = {
  sin: {
    argCount: 1,
    autoConvertArgs: true,
    fn: ([n]) => Math.sin(N(n).valueOf()),
    functor: angleOpFunctor,
  },
  asin: {
    argCount: 1,
    autoConvertArgs: true,
    fn: ([n]) => Math.asin(N(n).valueOf()),
    functor: arcFunctor,
  },
  cos: {
    argCount: 1,
    autoConvertArgs: true,
    fn: ([n]) => Math.cos(N(n).valueOf()),
    functor: angleOpFunctor,
  },
  acos: {
    argCount: 1,
    autoConvertArgs: true,
    fn: ([n]) => Math.acos(N(n).valueOf()),
    functor: arcFunctor,
  },
  tan: {
    argCount: 1,
    autoConvertArgs: true,
    fn: ([n]) => Math.tan(N(n).valueOf()),
    functor: angleOpFunctor,
  },
  atan: {
    argCount: 1,
    autoConvertArgs: true,
    fn: ([n]) => Math.atan(N(n).valueOf()),
    functor: arcFunctor,
  },
};
