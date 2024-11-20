// eslint-disable-next-line no-restricted-imports
import { buildType, Type } from '@decipad/language-types';
import { overloadBuiltin } from '../overloadBuiltin';
import type { Functor } from '../types';
import { binOpBuiltinForUniversalEval } from '../utils/binopBuiltinForUniversalEval';
import { wasmUniversalBinopEval } from '../utils/wasmUniversalBinopEval';
import { computeBackendSingleton } from '@decipad/compute-backend-js';

const multUniversalEval = wasmUniversalBinopEval((...args) =>
  computeBackendSingleton.computeBackend.multiply_results(...args)
);

const multFunctorNums: Functor = async ([a, b]) =>
  Type.combine(
    a.isScalar('number'),
    b.isScalar('number'),
    (await a.sharePercentage(b)).multiplyUnit(b.unit)
  );

const multFunctorLCol: Functor = async ([a, b]) => {
  const aRed = await a.reducedToLowest();
  const bRed = await b.reducedToLowest();
  const multRes = await Type.combine(
    aRed.isScalar('number'),
    bRed.isScalar('number'),
    (await aRed.sharePercentage(bRed)).multiplyUnit(bRed.unit)
  );
  return multRes.mapType(async (t) => buildType.column(t, a.indexedBy));
};

const multFunctorRCol: Functor = async ([a, b]) => {
  const aRed = await a.reducedToLowest();
  const bRed = await b.reducedToLowest();
  const multRes = await Type.combine(
    aRed.isScalar('number'),
    bRed.isScalar('number'),
    (await bRed.sharePercentage(aRed)).multiplyUnit(aRed.unit)
  );
  return multRes.mapType(async (t) => buildType.column(t, b.indexedBy));
};

const multBinopPrimitiveFunctor: Functor = async (...args) =>
  Type.either(
    multFunctorNums(...args),
    multFunctorLCol(...args),
    multFunctorRCol(...args)
  );

export const mult = overloadBuiltin(
  '*',
  2,
  [
    ...binOpBuiltinForUniversalEval({
      primitiveFunctor: multBinopPrimitiveFunctor,
      primitiveReverseFunctor: multBinopPrimitiveFunctor,
      universalEval: multUniversalEval,
    }),
  ],
  'infix'
);
