import type DeciNumber from '@decipad/number';
import { ONE } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import type { Type } from '@decipad/language-types';
import type { Result } from '@decipad/language-interfaces';
import { coherceToFraction } from '../utils/coherceToFraction';
import { overloadBuiltin } from '../overloadBuiltin';
import { secondArgIsPercentage } from '../utils/secondArgIsPercentage';
import { dateOverloads } from '../dateOverloads';
import type { FullBuiltinSpec } from '../interfaces';
import { binopBuiltin } from '../utils/binopBuiltin';
import { binopFunctor } from '../utils/binopFunctor';
import { reverseBinopPrimitiveEval } from '../utils/reverseBinopPrimitiveEval';

const subtractPrimitive = async (
  n1: Result.OneResult,
  n2: Result.OneResult,
  types: Type[]
): Promise<DeciNumber> => {
  if (secondArgIsPercentage(types)) {
    return coherceToFraction(n1).mul(ONE.sub(coherceToFraction(n2)));
  }

  return coherceToFraction(n1).sub(coherceToFraction(n2));
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
