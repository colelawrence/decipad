// eslint-disable-next-line no-restricted-imports
import { Type } from '@decipad/language-types';
import { coerceToFraction } from '../utils/coerceToFraction';
import { binopBuiltin } from '../utils/binopBuiltin';
import { overloadBuiltin } from '../overloadBuiltin';
import type { Functor } from '../types';
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
    primitiveEval: (n1, n2) => coerceToFraction(n1).div(coerceToFraction(n2)),
    primitiveReverseEval: (n1, n2) =>
      coerceToFraction(n2).div(coerceToFraction(n1)),
    primitiveFunctor: divFunctor,
    primitiveReverseFunctor: reverseFunctor(divFunctor),
  }),
  'infix'
);
