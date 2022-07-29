import Fraction from '@decipad/fraction';
import { once } from 'ramda';
import { Type, build as t } from '../../type';
import { F } from '../../utils';
import { BuiltinSpec } from '../interfaces';

const radian = once(() =>
  t.number([
    {
      unit: 'radian',
      exp: F(1),
      multiplier: F(1),
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
    fn: ([n]) => Math.sin(new Fraction(n).valueOf()),
    functor: angleOpFunctor,
  },
  asin: {
    argCount: 1,
    autoConvertArgs: true,
    fn: ([n]) => Math.asin(new Fraction(n).valueOf()),
    functor: arcFunctor,
  },
  cos: {
    argCount: 1,
    autoConvertArgs: true,
    fn: ([n]) => Math.cos(new Fraction(n).valueOf()),
    functor: angleOpFunctor,
  },
  acos: {
    argCount: 1,
    autoConvertArgs: true,
    fn: ([n]) => Math.acos(new Fraction(n).valueOf()),
    functor: arcFunctor,
  },
  tan: {
    argCount: 1,
    autoConvertArgs: true,
    fn: ([n]) => Math.tan(new Fraction(n).valueOf()),
    functor: angleOpFunctor,
  },
  atan: {
    argCount: 1,
    autoConvertArgs: true,
    fn: ([n]) => Math.atan(new Fraction(n).valueOf()),
    functor: arcFunctor,
  },
};
