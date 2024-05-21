import type { Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Type } from '@decipad/language-types';
import { coherceToFraction } from '../utils/coherceToFraction';
import { overloadBuiltin } from '../overloadBuiltin';
import { binopBuiltin } from '../utils/binopBuiltin';
import type { Functor } from '../interfaces';
import { reverseFunctor } from '../utils/reverseFunctor';

const multEval = (n1: Result.OneResult, n2: Result.OneResult) =>
  coherceToFraction(n1).mul(coherceToFraction(n2));

const multFunctor: Functor = async ([a, b]) =>
  Type.combine(
    a.isScalar('number'),
    b.isScalar('number'),
    (await a.sharePercentage(b)).multiplyUnit(b.unit)
  );

export const mult = overloadBuiltin(
  '*',
  2,
  binopBuiltin('*', {
    primitiveEval: multEval,
    primitiveReverseEval: multEval,
    primitiveFunctor: multFunctor,
    primitiveReverseFunctor: reverseFunctor(multFunctor),
  }),
  'infix'
);
