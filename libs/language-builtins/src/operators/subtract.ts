import { overloadBuiltin } from '../overloadBuiltin';
import { dateOverloads } from '../dateOverloads';
import type { FullBuiltinSpec } from '../types';
import { scalarNumericBinopFunctor } from '../utils/scalarNumericBinopFunctor';
import { wasmUniversalBinopEval } from '../utils/wasmUniversalBinopEval';
import { computeBackendSingleton } from '@decipad/compute-backend-js';
import { binOpBuiltinForUniversalEval } from '../utils/binopBuiltinForUniversalEval';

/*
const subtractPrimitive = async (
  n1: Result.OneResult,
  n2: Result.OneResult,
  types: Type[]
): Promise<DeciNumberBase> => {
  if (secondArgIsPercentage(types)) {
    return coerceToFraction(n1).mul(ONE.sub(coerceToFraction(n2)));
  }

  return coerceToFraction(n1).sub(coerceToFraction(n2));
};
*/

const subUniversalEval = wasmUniversalBinopEval((...args) =>
  computeBackendSingleton.computeBackend.subtract_results(...args)
);

export const subtract: FullBuiltinSpec = overloadBuiltin(
  '-',
  2,
  [
    ...binOpBuiltinForUniversalEval({
      primitiveFunctor: scalarNumericBinopFunctor,
      primitiveReverseFunctor: scalarNumericBinopFunctor,
      universalEval: subUniversalEval,
    }),
    ...dateOverloads['-'],
  ],
  'infix'
);
