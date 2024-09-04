/* eslint-disable no-bitwise */
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line no-restricted-imports
import { Value, serializeType } from '@decipad/language-types';
import type { BuiltinSpec } from '../types';
import {
  computeBackendSingleton,
  deserializeResult,
  serializeResult,
} from '@decipad/compute-backend-js';
import DeciNumber from '@decipad/number';

export const reducerOperators: { [fname: string]: BuiltinSpec } = {
  total: {
    noAutoconvert: true,
    argCount: 1,
    argCardinalities: [[2]],
    isReducer: true,
    fnValues: async ([nums], [numsType]) => {
      const column = Value.getColumnLike(nums);

      const col = await serializeResult({
        type: serializeType(numsType),
        value: await column.getData(),
      });

      const sum =
        computeBackendSingleton.computeBackend.sum_result_fraction_column(col);

      const deserializedResult = deserializeResult(sum as any);

      return Value.Scalar.fromValue(deserializedResult.value as DeciNumber);
    },
    functionSignature: 'column<number:R> -> R',
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
