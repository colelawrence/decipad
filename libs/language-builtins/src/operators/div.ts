// eslint-disable-next-line no-restricted-imports
import { Type } from '@decipad/language-types';
import { coherceToFraction } from '../utils/coherceToFraction';
import { binopBuiltin } from '../utils/binopBuiltin';
import { overloadBuiltin } from '../overloadBuiltin';
import type { Functor } from '../interfaces';
import { reverseFunctor } from '../utils/reverseFunctor';

const divFunctor: Functor = async ([a, b]) =>
  Type.combine(
    a.isScalar('number'),
    b.isScalar('number'),
    (await a.sharePercentage(b)).divideUnit(b.unit)
  );

export const div = overloadBuiltin(
  '/',
  2,
  binopBuiltin('/', {
    primitiveEval: (n1, n2) => coherceToFraction(n1).div(coherceToFraction(n2)),
    primitiveReverseEval: (n1, n2) =>
      coherceToFraction(n2).div(coherceToFraction(n1)),
    primitiveFunctor: divFunctor,
    primitiveReverseFunctor: reverseFunctor(divFunctor),
  }),
  'infix'
);
