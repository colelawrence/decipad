/* eslint-disable no-underscore-dangle */
import Fraction from 'fraction.js';
import produce from 'immer';
import { getDefined } from '@decipad/utils';
import { getInstanceof } from '../../utils';
import { Type, build as t } from '../../type';
import {
  Column,
  AnyValue,
  fromJS,
  Scalar,
  Value,
} from '../../interpreter/Value';
import { AST } from '../../parser';
import { overloadBuiltin } from '../overloadBuiltin';
import { dateOverloads } from '../dateOverloads';
import { BuiltinSpec } from '../interfaces';
import { RuntimeError } from '../../interpreter';
import { compare } from '../../interpreter/compare-values';

const ZERO = new Fraction(0);

const simpleUnaryOpFunctor = ([n]: Type[]) => n.isScalar('number');

const binopFunctor = ([a, b]: Type[]) =>
  Type.combine(a.isScalar('number'), b.sameAs(a));

const numberReducerFunctor = ([t]: Type[]) =>
  Type.combine(t.reducedOrSelf().isScalar('number'));

const removeUnit = produce((t: Type) => {
  if (t.type === 'number') t.unit = null;
});

const exponentiationFunctor = ([a, b]: Type[], values?: AST.Expression[]) => {
  const bValue = getDefined(getDefined(values)[1]);
  if (
    a.unit &&
    a.unit.args.length > 0 &&
    (bValue.type !== 'literal' || bValue.args[0] !== 'number')
  ) {
    return t.impossible('exponent value must be a literal number');
  }
  return binopFunctor([a, removeUnit(b)]).mapType(
    produce((arg1) => {
      for (const unit of arg1.unit?.args ?? []) {
        unit.exp =
          (unit.exp || 1) * (getDefined(bValue.args[1]).valueOf() as number);
      }
    })
  );
};

const roundFunctor: BuiltinSpec['functor'] = ([
  n,
  decimalPrecision = t.number(),
]) => Type.combine(decimalPrecision.isScalar('number'), n.isScalar('number'));

const firstArgumentReducedOrSelfFunctor = ([t]: Type[]): Type =>
  t.reducedOrSelf();

const coherceToFraction = (value: unknown): Fraction => {
  return getInstanceof(value, Fraction);
};

const coherceToArray = <T>(value: T | T[]): T[] => {
  return Array.isArray(value) ? value : [value];
};

const max = ([value]: Value[]): Value => {
  let max: Value | undefined;
  if (!(value instanceof Column)) {
    return value;
  }
  for (let i = 0; i < value.rowCount; i += 1) {
    const cellValue = value.atIndex(i);
    if (max) {
      if (compare(cellValue, max) > 0) {
        max = cellValue;
      }
    } else {
      max = cellValue;
    }
  }
  if (max == null) {
    throw new RuntimeError('max: no elements');
  }
  return max;
};

const min = ([value]: Value[]): Value => {
  let min: Value | undefined;
  if (!(value instanceof Column)) {
    return value;
  }
  for (let i = 0; i < value.rowCount; i += 1) {
    const cellValue = value.atIndex(i);
    if (min) {
      if (compare(cellValue, min) < 0) {
        min = cellValue;
      }
    } else {
      min = cellValue;
    }
  }
  if (min == null) {
    throw new RuntimeError('min: no elements');
  }
  return min;
};

const valueToResult = (fn: ([value]: Value[]) => Value) => {
  return (values: Value[]): AnyValue => fromJS(fn(values).getData());
};

const average = ([value]: Value[]): AnyValue => {
  const fractions = coherceToArray(value.getData()).map(coherceToFraction);
  if (fractions.length === 0) {
    throw new RuntimeError('average needs at least one element');
  }
  return fromJS(
    fractions
      .reduce((acc, n) => acc.add(n), new Fraction(0))
      .div(fractions.length)
  );
};

export const mathOperators: Record<string, BuiltinSpec> = {
  abs: {
    argCount: 1,
    noAutoconvert: true,
    fn: (n) => Math.abs(n as number),
    functor: simpleUnaryOpFunctor,
  },
  round: {
    argCount: [1, 2],
    noAutoconvert: true,
    functor: roundFunctor,
    fn: (n: Fraction, decimalPrecision: Fraction = ZERO) =>
      n.round(decimalPrecision.valueOf()),
  },
  roundup: {
    argCount: [1, 2],
    noAutoconvert: true,
    functor: roundFunctor,
    fn: (n: Fraction, decimalPrecision: Fraction = ZERO) =>
      n.ceil(decimalPrecision.valueOf()),
  },
  ceil: {
    aliasFor: 'roundup',
  },
  rounddown: {
    argCount: [1, 2],
    noAutoconvert: true,
    functor: roundFunctor,
    fn: (n: Fraction, decimalPrecision: Fraction = ZERO) =>
      n.floor(decimalPrecision.valueOf()),
  },
  floor: {
    aliasFor: 'rounddown',
  },
  max: {
    argCount: 1,
    functorNoAutomap: firstArgumentReducedOrSelfFunctor,
    fnValuesNoAutomap: valueToResult(max),
  },
  min: {
    argCount: 1,
    functorNoAutomap: firstArgumentReducedOrSelfFunctor,
    fnValuesNoAutomap: valueToResult(min),
  },
  average: {
    argCount: 1,
    functorNoAutomap: numberReducerFunctor,
    fnValuesNoAutomap: average,
  },
  avg: { aliasFor: 'average' },
  mean: { aliasFor: 'average' },
  averageif: {
    argCount: 2,
    noAutoconvert: true,
    fnValuesNoAutomap: (args: Value[]) => {
      const [__numbers, __bools] = args;
      const _numbers = __numbers.getData();
      const numbers = Array.isArray(_numbers) ? _numbers : [_numbers];
      const _bools = __bools.getData();
      const bools = Array.isArray(_bools) ? _bools : [_bools];
      if (numbers.length === 0) {
        throw new RuntimeError(
          'average: cannot compute average on zero elements'
        );
      }
      const res = numbers.reduce<[Fraction, number]>(
        (acc, elem, index) => {
          if (bools[index]) {
            return [acc[0].add(elem as Fraction), acc[1] + 1];
          } else {
            return acc;
          }
        },
        [new Fraction(0), 0]
      );
      return fromJS(res[0].div(res[1]));
    },
    functorNoAutomap: ([numbers, booleans]) =>
      Type.combine(
        booleans.reducedOrSelf().isScalar('boolean'),
        numbers.reducedOrSelf().isScalar('number')
      ),
  },
  avgif: { aliasFor: 'averageif' },
  meanif: { aliasFor: 'averageif' },
  sqrt: {
    noAutoconvert: true,
    argCount: 1,
    fn: (n: Fraction) => {
      return getInstanceof(n, Fraction).pow(0.5);
    },
    functor: ([n]) => Type.combine(n.isScalar('number'), n.divideUnit(2)),
  },
  ln: {
    argCount: 1,
    noAutoconvert: true,
    fn: (n) => Math.log(n),
    functor: simpleUnaryOpFunctor,
  },
  '+': overloadBuiltin('+', 2, [
    {
      argTypes: ['number', 'number'],
      fnValues: (n1, n2) =>
        Scalar.fromValue(
          (n1.getData() as Fraction).add(n2.getData() as Fraction)
        ),
      functor: binopFunctor,
    },
    {
      argTypes: ['string', 'string'],
      fnValues: (n1, n2) =>
        Scalar.fromValue(String(n1.getData()) + String(n2.getData())),
      functor: ([a, b]) =>
        Type.combine(a.isScalar('string'), b.isScalar('string')),
    },
    ...dateOverloads['+'],
  ]),
  '-': overloadBuiltin('-', 2, [
    {
      argTypes: ['number', 'number'],
      fnValues: (a, b) =>
        Scalar.fromValue(
          (a.getData() as Fraction).sub(b.getData() as Fraction)
        ),
      functor: binopFunctor,
    },
    ...dateOverloads['-'],
  ]),
  'unary-': {
    argCount: 1,
    noAutoconvert: true,
    fn: (a: Fraction) => a.neg(),
    functor: ([n]) => n.isScalar('number'),
  },
  '*': {
    argCount: 2,
    fn: (a, b) => {
      if (!(a instanceof Fraction)) {
        throw new Error('a needs to be a fraction');
      }
      return a.mul(b);
    },
    functor: ([a, b]) =>
      Type.combine(
        a.isScalar('number'),
        b.isScalar('number'),
        a.multiplyUnit(b.unit)
      ),
  },
  '/': {
    argCount: 2,
    fn: (a, b) => getInstanceof(a, Fraction).div(b),
    functor: ([a, b]) =>
      Type.combine(
        a.isScalar('number'),
        b.isScalar('number'),
        a.divideUnit(b.unit)
      ),
  },
  '%': {
    argCount: 2,
    fn: (a: Fraction, b: Fraction) => a.mod(b),
    functor: binopFunctor,
  },
  '**': {
    argCount: 2,
    fn: (a: Fraction, b: Fraction) => {
      const result = a.pow(b);
      if (result == null) {
        const resultNumber = a.valueOf() ** b.valueOf();
        if (Number.isNaN(resultNumber)) {
          throw new TypeError(
            `**: result of applying ${b.toString()} is not rational`
          );
        }
        return new Fraction(resultNumber);
      }
      return result;
    },
    noAutoconvert: true,
    functor: exponentiationFunctor,
  },
  '^': {
    aliasFor: '**',
  },
};
