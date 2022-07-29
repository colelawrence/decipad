/* eslint-disable no-underscore-dangle */
import Fraction from '@decipad/fraction';
import type { BuiltinSpec } from '../interfaces';
import { Value, fromJS } from '../../interpreter/Value';

export const reducerOperators: { [fname: string]: BuiltinSpec } = {
  total: {
    noAutoconvert: true,
    argCount: 1,
    argCardinalities: [2],
    isReducer: true,
    fn: ([nums]: number[][]) => nums.reduce((a, b) => a + b, 0),
    functionSignature: 'column<number:R> -> R',
  },
  sum: {
    aliasFor: 'total',
  },
  sumif: {
    argCount: 2,
    noAutoconvert: true,
    argCardinalities: [2, 2],
    fnValues: ([_numbers, _bools]: Value[]) => {
      const numbers = _numbers.getData() as Fraction[];
      const bools = _bools.getData() as boolean[];

      return fromJS(
        numbers.reduce<Fraction>(
          (count, elem, index) =>
            bools[index] ? count.add(elem as Fraction) : count,
          new Fraction(0)
        )
      );
    },
    functionSignature: 'column<number:R>, column<boolean> -> R',
  },
};
