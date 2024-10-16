// eslint-disable-next-line no-restricted-imports
import type { Type } from '@decipad/language-types';
// eslint-disable-next-line no-restricted-imports
import {
  Value,
  buildType,
  getResultGenerator,
  serializeType,
} from '@decipad/language-types';
import type { PromiseOrType } from '@decipad/utils';
import { zip } from '@decipad/generator-utils';
import type { DeciNumberBase } from '@decipad/number';
import type { Result, Value as ValueTypes } from '@decipad/language-interfaces';

import type { Evaluator, FullBuiltinSpec, Functor } from '../types';
import { reverseFunctor } from './reverseFunctor';
import { reverseEvaluator } from './reverseEvaluator';

export type BinopPrimitiveEval = (
  n1: Result.OneResult,
  n2: Result.OneResult,
  types: Type[]
) => PromiseOrType<DeciNumberBase | boolean | string | ValueTypes.TrendValue>;

interface BinopNumericBuiltinProps {
  primitiveEval: BinopPrimitiveEval;
  primitiveReverseEval: BinopPrimitiveEval;
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

const balancedEval =
  (
    fName: string,
    primitiveEval: BinopPrimitiveEval,
    primitiveFunctor: Functor
  ): Evaluator =>
  async ([a, b], types, utils, valueNodes) => {
    // here the first arg is a column and the second is a number
    const colA = Value.getColumnLike(a);
    const genA = getResultGenerator(await colA.getData());
    const colB = Value.getColumnLike(b);
    const genB = getResultGenerator(await colB.getData());

    const resultType = await balancedFunctor(primitiveFunctor)(
      types,
      valueNodes,
      utils
    );

    const zipped = (start = 0, end = Infinity) =>
      zip(genA(start, end), genB(start, end));

    const argTypes = await Promise.all(
      types.map(async (type) => type.reduced())
    );
    const serializedResultType = serializeType(await resultType.reduced());
    return new Value.FMappedColumn(
      zipped,
      serializedResultType,
      async ([aValue, bValue]) => primitiveEval(aValue, bValue, types),
      colA.meta?.bind(colA) ?? colB.meta?.bind(colB),
      `balancedEval<${fName}(${argTypes
        .map(serializeType)
        .map((t) => t.kind)
        .join(', ')})>`
    );
  };

const unbalancedEval =
  (primitiveEval: BinopPrimitiveEval, fName: string): Evaluator =>
  async ([a, b], [aType, bType]) => {
    // here the first arg is a column and the second is a number
    const colA = Value.getColumnLike(a);
    const types = [await aType.reduced(), bType];
    const serializedResultType = serializeType(bType);
    const bValue = await b.getData();
    return new Value.FMappedColumn(
      getResultGenerator(await colA.getData()),
      serializedResultType,
      async (value) => primitiveEval(value, bValue, types),
      colA.meta?.bind(colA),
      `unbalancedEval<${fName}(${[aType, bType]
        .map(serializeType)
        .map((t) => t.kind)
        .join(', ')})>`
    );
  };

export const binopBuiltin = (
  fName: string,
  {
    primitiveFunctor,
    primitiveReverseFunctor,
    primitiveEval,
    primitiveReverseEval,
  }: BinopNumericBuiltinProps
): FullBuiltinSpec[] => {
  const applyValues = async (
    [n1, n2]: ValueTypes.Value[],
    types: Type[]
  ): Promise<ValueTypes.Value> => {
    const result = await primitiveEval(
      await n1.getData(),
      await n2.getData(),
      types
    );
    if (Value.isTrendValue(result)) {
      return result;
    }
    return Value.Scalar.fromValue(result);
  };

  return [
    {
      // op(column<T>, column<T>) -> column<T>
      argCount: 2,
      argCardinalities: [[2, 2]],
      functor: balancedFunctor(primitiveFunctor),
      fnValues: balancedEval(fName, primitiveEval, primitiveFunctor),
    },
    {
      // op(column<T>, T) -> column<T>
      argCount: 2,
      argCardinalities: [[2, 1]],
      functor: unbalancedFunctor(primitiveFunctor),
      fnValues: unbalancedEval(primitiveEval, fName),
    },
    {
      // op(T, column<T>) -> column<T>
      argCount: 2,
      argCardinalities: [[1, 2]],
      functor: reverseFunctor(unbalancedFunctor(primitiveReverseFunctor)),
      fnValues: reverseEvaluator(unbalancedEval(primitiveReverseEval, fName)),
    },
    {
      // op(T, T) -> T
      argCount: 2,
      argCardinalities: [[1, 1]],
      fnValues: applyValues,
      functor: primitiveFunctor,
    },
  ];
};
