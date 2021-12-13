/* eslint-disable no-underscore-dangle */
import Fraction from 'fraction.js';
import { BuiltinSpec } from '../interfaces';
import { Value, fromJS } from '../../interpreter/Value';
import { Type } from '../../type';

export const reducerOperators: { [fname: string]: BuiltinSpec } = {
  total: {
    noAutoconvert: true,
    argCount: 1,
    argCardinalities: [2],
    isReducer: true,
    fn: (nums: number[]) => nums.reduce((a, b) => a + b, 0),
    functor: ([nums]) => nums.reduced().isScalar('number'),
  },
  sum: {
    aliasFor: 'total',
  },
  sumif: {
    argCount: 2,
    noAutoconvert: true,
    fnValuesNoAutomap: (args: Value[]) => {
      const [__numbers, __bools] = args;
      const _numbers = __numbers.getData();
      const numbers = Array.isArray(_numbers) ? _numbers : [_numbers];
      const _bools = __bools.getData();
      const bools = Array.isArray(_bools) ? _bools : [_bools];
      return fromJS(
        numbers.reduce<Fraction>(
          (count, elem, index) =>
            bools[index] ? count.add(elem as Fraction) : count,
          new Fraction(0)
        )
      );
    },
    functorNoAutomap: ([numbers, booleans]) =>
      Type.combine(
        booleans.reducedOrSelf().isScalar('boolean'),
        numbers.reducedOrSelf().isScalar('number')
      ),
  },
};
