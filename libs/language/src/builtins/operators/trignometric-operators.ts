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
    explanation: 'Takes an angle and gives us the ratio (opposite/hypotenuse).',
    formulaGroup: 'Trignometric',
    syntax: 'sin(Angle)',
    example: 'sin(1rad)',
  },
  asin: {
    argCount: 1,
    autoConvertArgs: true,
    fn: ([n]) => Math.asin(N(n).valueOf()),
    functor: arcFunctor,
    explanation:
      'Takes the ratio (opposite/hypotenuse) and gives us the angle.',
    formulaGroup: 'Trignometric',
    syntax: 'asin(Ratio)',
    example: 'sin(0.5)',
  },
  cos: {
    argCount: 1,
    autoConvertArgs: true,
    fn: ([n]) => Math.cos(N(n).valueOf()),
    functor: angleOpFunctor,
    explanation: 'Takes an angle and gives us the ratio (adjacent/hypotenuse).',
    formulaGroup: 'Trignometric',
    syntax: 'cos(Angle)',
    example: 'cos(1rad)',
  },
  acos: {
    argCount: 1,
    autoConvertArgs: true,
    fn: ([n]) => Math.acos(N(n).valueOf()),
    functor: arcFunctor,
    explanation:
      'Takes the ratio (adjacent/hypotenuse) and gives us the angle.',
    formulaGroup: 'Trignometric',
    syntax: 'acos(Ratio)',
    example: 'acos(0.5)',
  },
  tan: {
    argCount: 1,
    autoConvertArgs: true,
    fn: ([n]) => Math.tan(N(n).valueOf()),
    functor: angleOpFunctor,
    explanation: 'Takes an angle and gives us the ratio (opposite/adjacent).',
    formulaGroup: 'Trignometric',
    syntax: 'tan(Angle)',
    example: 'tan(1rad)',
  },
  atan: {
    argCount: 1,
    autoConvertArgs: true,
    fn: ([n]) => Math.atan(N(n).valueOf()),
    functor: arcFunctor,
    explanation: 'Takes the ratio opposite/adjacent and gives us the angle.',
    formulaGroup: 'Trignometric',
    syntax: 'tan(Ratio)',
    example: 'atan(0.5)',
  },
};
