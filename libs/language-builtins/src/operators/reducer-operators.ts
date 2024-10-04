/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line no-restricted-imports
import {
  getResultGenerator,
  serializeType,
  Type,
  Value,
} from '@decipad/language-types';
import type { BuiltinSpec, Evaluator } from '../types';
import {
  computeBackendSingleton,
  deserializeResult,
  serializeResult,
} from '@decipad/compute-backend-js';
import DeciNumber, { ZERO } from '@decipad/number';
import { createWasmEvaluator } from './wasm-evaluator';
import { getColumnLike, getTrendValue } from 'libs/language-types/src/Value';
import { map } from '@decipad/generator-utils';
import { getInstanceof } from '@decipad/utils';

const trendSumEval: Evaluator = async ([values]) => {
  // trend
  const trendGen = getResultGenerator(await getColumnLike(values).getData());

  const firstResult = await serializeResult({
    type: { kind: 'column', cellType: { kind: 'number' }, indexedBy: null },
    value: (start = 0, end = Infinity) =>
      map(trendGen(start, end), (value) => getTrendValue(value)?.first ?? ZERO),
    meta: undefined,
  });

  const firstSum = getInstanceof(
    deserializeResult(
      computeBackendSingleton.computeBackend.sum_result_fraction_column(
        firstResult
      ) as any
    ).value,
    DeciNumber
  );

  const lastResult = await serializeResult({
    type: { kind: 'column', cellType: { kind: 'number' }, indexedBy: null },
    value: (start = 0, end = Infinity) =>
      map(trendGen(start, end), (value) => getTrendValue(value)?.last ?? ZERO),
    meta: undefined,
  });

  const lastSum = getInstanceof(
    deserializeResult(
      computeBackendSingleton.computeBackend.sum_result_fraction_column(
        lastResult
      ) as any
    ).value,
    DeciNumber
  );

  return Value.Trend.from(firstSum, lastSum, lastSum.sub(firstSum));
};

const numericSumEval = createWasmEvaluator(
  (id) => computeBackendSingleton.computeBackend.sum(id),
  (result) => {
    return Value.Scalar.fromValue(result.value as DeciNumber);
  },
  async ([nums], [numsType]) => {
    const column = Value.getColumnLike(nums);

    const col = await serializeResult({
      type: serializeType(numsType),
      value: await column.getData(),
    });

    const sum =
      computeBackendSingleton.computeBackend.sum_result_fraction_column(col);

    const deserializedResult = deserializeResult(sum as any);

    return Value.Scalar.fromValue(deserializedResult.value as DeciNumber);
  }
);

export const reducerOperators: { [fname: string]: BuiltinSpec } = {
  total: {
    noAutoconvert: true,
    argCount: 1,
    argCardinalities: [[2]],
    isReducer: true,
    fnValues: async ([values], [type], ...rest) => {
      if (
        (await (await (await type.isColumn()).reduced()).isTrend())
          .errorCause == null
      ) {
        return trendSumEval([values], [type], ...rest);
      }
      return numericSumEval([values], [type], ...rest);
    },
    async functor([type]) {
      const cellType = await (await type.isColumn()).reduced();
      return Type.either(cellType.isScalar('number'), cellType.isTrend());
    },
    explanation: 'Adds all the elements of a column.`',
    formulaGroup: 'Columns',
    syntax: 'total(Column)',
    example: 'total(Prices)',
  },
  sum: {
    aliasFor: 'total',
    explanation: 'Adds all the elements of a column.`',
    formulaGroup: 'Columns',
    syntax: 'sum(Column)',
    example: 'sum(Prices)',
  },
  sumif: {
    argCount: 2,
    noAutoconvert: true,
    argCardinalities: [[2, 2]],
    fnValues: async ([numbers, bools], [numbersType, boolsType]) => {
      const column = Value.getColumnLike(numbers);
      const mask = Value.getColumnLike(bools);

      const serializedColumn = await serializeResult({
        type: serializeType(numbersType),
        value: await column.getData(),
      });

      const serializedMask = await serializeResult({
        type: serializeType(boolsType),
        value: await mask.getData(),
      });

      const sum =
        computeBackendSingleton.computeBackend.sumif_result_fraction_column(
          serializedColumn,
          serializedMask
        );

      const deserializedResult = deserializeResult(sum as any);

      return Value.Scalar.fromValue(deserializedResult.value as DeciNumber);
    },
    functionSignature: 'column<number:R>, column<boolean> -> R',
    explanation: 'Adds all the elements of a column that match condition.',
    syntax: 'sumif(Table.Column, Table.Column > 10)',
    example: 'sumif(Prices.Amount, Prices.Discount > 10)',
    formulaGroup: 'Columns',
  },
};
