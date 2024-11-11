// eslint-disable-next-line no-restricted-imports
import type { Type } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import { buildType } from '@decipad/language-types';
import type { PromiseOrType } from '@decipad/utils';
import type { Result, Value as ValueTypes } from '@decipad/language-interfaces';

import type { FullBuiltinSpec, Functor } from '../types';
import { reverseFunctor } from './reverseFunctor';

export type BinopUniveralEval = (
  n1: Result.OneResult,
  n2: Result.OneResult,
  types: Type[]
) => PromiseOrType<ValueTypes.Value>;

interface BinopNumericBuiltinProps {
  universalEval: BinopUniveralEval;
  primitiveFunctor: Functor;
  primitiveReverseFunctor: Functor;
}

const balancedFunctor =
  (primitiveFunctor: Functor): Functor =>
  async ([a, b], ...rest) => {
    // here the first arg is a column and the second is a number
    const newTypes = [
      await (await a.isColumn()).reduced(),
      await (await b.isColumn()).reduced(),
    ];
    return (await primitiveFunctor(newTypes, ...rest)).mapType(async (t) =>
      buildType.column(t, a.indexedBy)
    );
  };

const unbalancedFunctor =
  (primitiveFunctor: Functor): Functor =>
  async ([a, b], ...rest) => {
    // here the first arg is a column and the second is a number
    const newTypes = [await (await a.isColumn()).reduced(), b];
    return (await primitiveFunctor(newTypes, ...rest)).mapType(async (t) =>
      buildType.column(t, a.indexedBy)
    );
  };

export const binOpBuiltinForUniversalEval = ({
  primitiveFunctor,
  primitiveReverseFunctor,
  universalEval,
}: BinopNumericBuiltinProps): FullBuiltinSpec[] => {
  const applyValues = async (
    [n1, n2]: ValueTypes.Value[],
    types: Type[]
  ): Promise<ValueTypes.Value> => {
    return universalEval(await n1.getData(), await n2.getData(), types);
  };

  return [
    {
      // op(column<T>, column<T>) -> column<T>
      argCount: 2,
      argCardinalities: [[2, 2]],
      functor: balancedFunctor(primitiveFunctor),
      fnValues: applyValues,
    },
    {
      // op(column<T>, T) -> column<T>
      argCount: 2,
      argCardinalities: [[2, 1]],
      functor: unbalancedFunctor(primitiveFunctor),
      fnValues: applyValues,
    },
    {
      // op(T, column<T>) -> column<T>
      argCount: 2,
      argCardinalities: [[1, 2]],
      functor: reverseFunctor(unbalancedFunctor(primitiveReverseFunctor)),
      fnValues: applyValues,
    },
    {
      // op(T, T) -> T
      argCount: 2,
      argCardinalities: [[1, 1]],
      functor: primitiveFunctor,
      fnValues: applyValues,
    },
  ];
};
