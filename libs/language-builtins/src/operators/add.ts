import type { DeciNumberBase } from '@decipad/number';
import { ONE } from '@decipad/number';
import type { Result } from '@decipad/language-interfaces';
// eslint-disable-next-line no-restricted-imports
import { Type, Value } from '@decipad/language-types';
import { overloadBuiltin } from '../overloadBuiltin';
import { dateOverloads } from '../dateOverloads';
import { coerceToFraction } from '../utils/coerceToFraction';
import { secondArgIsPercentage } from '../utils/secondArgIsPercentage';
import type { FullBuiltinSpec } from '../types';
import { binopBuiltin } from '../utils/binopBuiltin';
import { binopFunctor } from '../utils/binopFunctor';

const addPrimitive = async (
  n1: Result.OneResult,
  n2: Result.OneResult,
  types: Type[]
): Promise<DeciNumberBase> => {
  if (secondArgIsPercentage(types)) {
    return coerceToFraction(n1).mul(coerceToFraction(n2).add(ONE));
  }

  return coerceToFraction(n1).add(coerceToFraction(n2));
};

export const add: FullBuiltinSpec = overloadBuiltin(
  '+',
  2,
  [
    ...binopBuiltin('+', {
      primitiveFunctor: binopFunctor,
      primitiveReverseFunctor: binopFunctor,
      primitiveEval: addPrimitive,
      primitiveReverseEval: addPrimitive,
    }),
    {
      argCount: 2,
      argCardinalities: [[1, 1]],
      fnValues: async ([n1, n2]) =>
        Value.Scalar.fromValue(
          String(await n1.getData()) + String(await n2.getData())
        ),
      functor: async ([a, b]) =>
        Type.combine(a.isScalar('string'), b.isScalar('string')),
    },
    ...dateOverloads['+'],
  ],
  'infix'
);
