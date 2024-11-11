// eslint-disable-next-line no-restricted-imports
import { Type } from '@decipad/language-types';
import { overloadBuiltin } from '../overloadBuiltin';
import { dateOverloads } from '../dateOverloads';
import type { FullBuiltinSpec, Functor } from '../types';
import { scalarNumericBinopFunctor } from '../utils/scalarNumericBinopFunctor';
import { binOpBuiltinForUniversalEval } from '../utils/binopBuiltinForUniversalEval';
import { computeBackendSingleton } from '@decipad/compute-backend-js';
import { wasmUniversalBinopEval } from '../utils/wasmUniversalBinopEval';

const addStringsBinopPrimitiveFunctor: Functor = async ([a, b]) =>
  (await a.isScalar('string')).sameAs(b);

const addBinopPrimitiveFunctor: Functor = async (...args) =>
  Type.either(
    scalarNumericBinopFunctor(...args),
    addStringsBinopPrimitiveFunctor(...args)
  );

const addUniversalEval = wasmUniversalBinopEval((...args) =>
  computeBackendSingleton.computeBackend.add_results(...args)
);

export const add: FullBuiltinSpec = overloadBuiltin(
  '+',
  2,
  [
    ...binOpBuiltinForUniversalEval({
      primitiveFunctor: addBinopPrimitiveFunctor,
      primitiveReverseFunctor: addBinopPrimitiveFunctor,
      universalEval: addUniversalEval,
    }),
    ...dateOverloads['+'],
  ],
  'infix'
);
