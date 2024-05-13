/* eslint-disable no-bitwise */
// eslint-disable-next-line no-restricted-imports
import { Value } from '@decipad/language-types';
import type { BuiltinSpec } from '../interfaces';
import { coherceToFraction } from '../utils/coherceToFraction';

export const reducerOperators: { [fname: string]: BuiltinSpec } = {
  total: {
    noAutoconvert: true,
    argCount: 1,
    argCardinalities: [[2]],
    isReducer: true,
    fnValues: async ([nums]) => {
      let acc = 0;
      for await (const v of Value.getColumnLike(nums).values()) {
        const f = coherceToFraction(await v.getData());
        if (f.infinite) {
          return Value.Scalar.fromValue(f);
        }
        const ff = f.valueOf();
        acc += ff;
      }

      return Value.Scalar.fromValue(acc);
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
    fnValues: async ([numbers, bools]: Value.Value[]) => {
      if (!Value.isColumnLike(numbers)) {
        return numbers;
      }
      if (!Value.isColumnLike(bools)) {
        throw new Error('Expected second argument to be a column of booleans');
      }

      let acc = 0;
      const boolsIt = bools.values();
      for await (const n of numbers.values()) {
        const b = await boolsIt.next();
        if (b.done) {
          throw new Error(
            'sumif requires both arguments to have the same length'
          );
        }
        if (await b.value.getData()) {
          const f = coherceToFraction(await n.getData());
          if (f.infinite) {
            return Value.Scalar.fromValue(f);
          }
          const ff = f.valueOf();
          acc += ff;
        }
      }

      return Value.Scalar.fromValue(acc);
    },
    functionSignature: 'column<number:R>, column<boolean> -> R',
    explanation: 'Adds all the elements of a column that match condition.',
    syntax: 'sumif(Table.Column, Table.Column > 10)',
    example: 'sumif(Prices.Amount, Prices.Discount > 10)',
    formulaGroup: 'Columns',
  },
};
