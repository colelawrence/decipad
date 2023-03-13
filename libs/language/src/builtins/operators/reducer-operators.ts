import DeciNumber, { ZERO } from '@decipad/number';
import type { BuiltinSpec } from '../interfaces';
import { Value, fromJS } from '../../value';

export const reducerOperators: { [fname: string]: BuiltinSpec } = {
  total: {
    noAutoconvert: true,
    argCount: 1,
    argCardinalities: [2],
    isReducer: true,
    fn: ([nums]: DeciNumber[][]) => nums.reduce((a, b) => a.add(b), ZERO),
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
    fnValues: ([_numbers, _bools]: Value[]) => {
      const numbers = _numbers.getData() as DeciNumber[];
      const bools = _bools.getData() as boolean[];

      return fromJS(
        numbers.reduce<DeciNumber>(
          (count, elem, index) =>
            bools[index] ? count.add(elem as DeciNumber) : count,
          ZERO
        )
      );
    },
    functionSignature: 'column<number:R>, column<boolean> -> R',
    explanation: 'Adds all the elements of a column that match condition.',
    syntax: 'sumif(Table.Column, Table.Column > 10)',
    example: 'sumif(Prices.Amount, Prices.Discount > 10)',
    formulaGroup: 'Columns',
  },
};
