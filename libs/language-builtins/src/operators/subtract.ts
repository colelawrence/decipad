import type { DeciNumberBase } from '@decipad/number';
import { ONE } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import type { Type } from '@decipad/language-types';
import type { Result } from '@decipad/language-interfaces';
import { coerceToFraction } from '../utils/coerceToFraction';
import { overloadBuiltin } from '../overloadBuiltin';
import { secondArgIsPercentage } from '../utils/secondArgIsPercentage';
import { dateOverloads } from '../dateOverloads';
import type { FullBuiltinSpec } from '../types';
import { binopBuiltin } from '../utils/binopBuiltin';
import { binopFunctor } from '../utils/binopFunctor';
import { reverseBinopPrimitiveEval } from '../utils/reverseBinopPrimitiveEval';

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

export const subtract: FullBuiltinSpec = overloadBuiltin(
  '-',
  2,
  [
    ...binopBuiltin('-', {
      primitiveFunctor: binopFunctor,
      primitiveReverseFunctor: binopFunctor,
      primitiveEval: subtractPrimitive,
      primitiveReverseEval: reverseBinopPrimitiveEval(subtractPrimitive),
    }),
    ...dateOverloads['-'],
  ],
  'infix'
);
