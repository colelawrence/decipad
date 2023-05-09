import { ZERO } from '@decipad/number';
import type { BuiltinSpec } from '../interfaces';
import {
  Scalar,
  Value,
  fromJS,
  getColumnLike,
  isColumnLike,
} from '../../value';
import { coherceToFraction } from '../../utils/coherceToFraction';

export const reducerOperators: { [fname: string]: BuiltinSpec } = {
  total: {
    noAutoconvert: true,
    argCount: 1,
    argCardinalities: [2],
    isReducer: true,
    fnValues: async ([nums]) => {
      let acc = ZERO;
      for await (const v of getColumnLike(nums).values()) {
        acc = acc.add(coherceToFraction(coherceToFraction(await v.getData())));
      }
      return Scalar.fromValue(acc);
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
    argCardinalities: [2, 2],
    fnValues: async ([numbers, bools]: Value[]) => {
      if (!isColumnLike(numbers)) {
        return numbers;
      }
      if (!isColumnLike(bools)) {
        throw new Error('Expected second argument to be a column of booleans');
      }
      let acc = ZERO;
      const boolsIt = bools.values();
      for await (const n of numbers.values()) {
        const b = await boolsIt.next();
        if (b.done) {
          throw new Error(
            'sumif requires both arguments to have the same length'
          );
        }
        if (await b.value.getData()) {
          acc = acc.add(coherceToFraction(await n.getData()));
        }
      }
      return fromJS(acc);
    },
    functionSignature: 'column<number:R>, column<boolean> -> R',
    explanation: 'Adds all the elements of a column that match condition.',
    syntax: 'sumif(Table.Column, Table.Column > 10)',
    example: 'sumif(Prices.Amount, Prices.Discount > 10)',
    formulaGroup: 'Columns',
  },
};
