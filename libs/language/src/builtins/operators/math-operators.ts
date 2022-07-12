/* eslint-disable no-underscore-dangle */
import produce from 'immer';
import Fraction, { pow } from '@decipad/fraction';
import { getDefined, zip } from '@decipad/utils';
import { RuntimeError, Realm } from '../../interpreter';
import { F, getInstanceof, multiplyMultipliers } from '../../utils';
import { InferError, Type, build as t } from '../../type';
import { fromJS, Scalar, Value, isColumnLike } from '../../interpreter/Value';
import { AST } from '../../parser';
import { overloadBuiltin } from '../overloadBuiltin';
import { dateOverloads } from '../dateOverloads';
import { BuiltinSpec } from '../interfaces';
import { compare } from '../../interpreter/compare-values';
import { Context } from '../../infer';

import { simpleExpressionEvaluate } from '../../interpreter/simple-expression-evaluate';

const ZERO = new Fraction(0);

const simpleUnaryOpFunctor = ([n]: Type[]) => n.isScalar('number');

const binopFunctor = ([a, b]: Type[]) =>
  Type.combine(a.isScalar('number'), b.sameAs(a));

const numberReducerFunctor = ([t]: Type[]) =>
  Type.combine(t.reduced().isScalar('number'));

const removeUnit = produce((t: Type) => {
  if (t.type === 'number') t.unit = null;
});

const exponentiationFunctor = (
  [a, b]: Type[],
  values?: AST.Expression[],
  context?: Context
) => {
  const bValue = getDefined(values?.[1]);
  const ctx = getDefined(context, 'context should be defined');

  let u: Fraction;
  if (a.unit && a.unit.args.length > 0) {
    const realm = new Realm(ctx);
    try {
      u = simpleExpressionEvaluate(realm, bValue).getData();
    } catch (err) {
      if (err instanceof InferError) {
        return t.impossible(err);
      } else {
        throw err;
      }
    }
    return binopFunctor([a, removeUnit(b)]).mapType(
      produce((arg1) => {
        for (const unit of arg1.unit?.args ?? []) {
          unit.exp = (unit.exp || F(1)).mul(u);
        }
      })
    );
  } else {
    return binopFunctor([a, removeUnit(b)]);
  }
};

const roundFunctor: BuiltinSpec['functor'] = ([
  n,
  decimalPrecision = t.number(),
]) => Type.combine(decimalPrecision.isScalar('number'), n.isScalar('number'));

const roundWrap = (
  round: (f: Fraction, decimalPrecisionValue: number) => Fraction
): BuiltinSpec['fn'] => {
  return ([nValue, decimalPrecisionValue], [type] = []) => {
    const n = getInstanceof(nValue, Fraction);
    const multiplier = multiplyMultipliers(type.unit);
    const decimalPrecision = decimalPrecisionValue
      ? getInstanceof(decimalPrecisionValue, Fraction)
      : ZERO;
    // in order for the round function to round at the correct precision, we need to first divide by
    // the unit multiplier, do the rouding, and *then* multiply by it at the end.
    return round(n.div(multiplier), decimalPrecision.valueOf()).mul(multiplier);
  };
};

const firstArgumentReducedFunctor = ([t]: Type[]) => t.reduced();

const coherceToFraction = (value: unknown): Fraction => {
  return getInstanceof(value, Fraction);
};

const max = ([value]: Value[]): Value => {
  let max: Value | undefined;
  if (!isColumnLike(value)) {
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
  if (!isColumnLike(value)) {
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

const average = ([value]: Value[]): Value => {
  const fractions = (value.getData() as Fraction[]).map(coherceToFraction);
  if (fractions.length === 0) {
    throw new RuntimeError('average needs at least one element');
  }
  return fromJS(
    fractions
      .reduce((acc, n) => acc.add(n), new Fraction(0))
      .div(fractions.length)
  );
};

const median = ([value]: Value[]): Value => {
  const fractions = (value.getData() as Fraction[]).map(coherceToFraction);
  if (fractions.length === 0) {
    throw new RuntimeError('median needs at least one element');
  }
  const sortedValues = fractions.sort((f1, f2) => f1.compare(f2));
  const { length } = sortedValues;
  const rightCenterPos = Math.floor(length / 2);
  const rightCenter = sortedValues[rightCenterPos];
  if (length % 2 === 1) {
    return fromJS(rightCenter);
  }
  const leftCenter = sortedValues[rightCenterPos - 1];
  return fromJS(leftCenter.add(rightCenter).div(2));
};

export const mathOperators: Record<string, BuiltinSpec> = {
  abs: {
    argCount: 1,
    noAutoconvert: true,
    fn: ([n]) => Math.abs(n as number),
    functor: simpleUnaryOpFunctor,
  },
  round: {
    argCount: [1, 2],
    noAutoconvert: true,
    functor: roundFunctor,
    fn: roundWrap((n: Fraction, decimalPlaces: number) =>
      n.round(decimalPlaces)
    ),
  },
  roundup: {
    argCount: [1, 2],
    noAutoconvert: true,
    functor: roundFunctor,
    fn: roundWrap((n: Fraction, decimalPlaces: number) =>
      n.ceil(decimalPlaces)
    ),
  },
  ceil: {
    aliasFor: 'roundup',
  },
  rounddown: {
    argCount: [1, 2],
    noAutoconvert: true,
    functor: roundFunctor,
    fn: roundWrap((n: Fraction, decimalPlaces: number) =>
      n.floor(decimalPlaces)
    ),
  },
  floor: {
    aliasFor: 'rounddown',
  },
  max: {
    argCount: 1,
    argCardinalities: [2],
    functor: firstArgumentReducedFunctor,
    fnValues: max,
  },
  min: {
    argCount: 1,
    argCardinalities: [2],
    functor: firstArgumentReducedFunctor,
    fnValues: min,
  },
  average: {
    argCount: 1,
    argCardinalities: [2],
    functor: numberReducerFunctor,
    fnValues: average,
  },
  avg: { aliasFor: 'average' },
  mean: { aliasFor: 'average' },
  averageif: {
    argCount: 2,
    noAutoconvert: true,
    argCardinalities: [2, 2],
    fnValues: ([_numbers, _bools]: Value[]) => {
      const numbers = _numbers.getData() as Fraction[];
      const bools = _bools.getData() as boolean[];
      if (numbers.length === 0) {
        throw new RuntimeError(
          'average: cannot compute average on zero elements'
        );
      }

      let count = 0;
      let sum = new Fraction(0);

      for (const [bool, num] of zip(bools, numbers)) {
        if (bool) {
          count++;
          sum = sum.add(num);
        }
      }

      return fromJS(sum.div(count));
    },
    functor: ([numbers, booleans]) =>
      Type.combine(
        booleans.reduced().isScalar('boolean'),
        numbers.reduced().isScalar('number')
      ),
  },
  avgif: { aliasFor: 'averageif' },
  meanif: { aliasFor: 'averageif' },
  median: {
    argCount: 1,
    argCardinalities: [2],
    functor: numberReducerFunctor,
    fnValues: median,
  },
  sqrt: {
    argCount: 1,
    fn: ([n]) => {
      let result: Fraction | undefined;
      try {
        result = pow(getInstanceof(n, Fraction), F(1, 2));
      } catch (err) {
        console.error(err);
      }
      if (result == null) {
        // TODO: fraction.js gives us a null result when the result is non-rational
        // TODO: this is an approximation, so we should warn the user
        const nonRationalResult = n.valueOf() ** 0.5;
        if (Number.isNaN(nonRationalResult)) {
          throw new RuntimeError(
            `square root of ${n.toString()} is not a number`
          );
        }
        result = new Fraction(nonRationalResult);
      }
      return result;
    },
    functor: ([n]) => Type.combine(n.isScalar('number'), n.divideUnit(2)),
  },
  ln: {
    argCount: 1,
    noAutoconvert: true,
    fn: ([n]) => Math.log(n),
    functor: simpleUnaryOpFunctor,
  },
  '+': overloadBuiltin('+', 2, [
    {
      argTypes: ['number', 'number'],
      fnValues: ([n1, n2]) => {
        return Scalar.fromValue(
          (n1.getData() as Fraction).add(n2.getData() as Fraction)
        );
      },
      functor: binopFunctor,
    },
    {
      argTypes: ['string', 'string'],
      fnValues: ([n1, n2]) =>
        Scalar.fromValue(String(n1.getData()) + String(n2.getData())),
      functor: ([a, b]) =>
        Type.combine(a.isScalar('string'), b.isScalar('string')),
    },
    ...dateOverloads['+'],
  ]),
  '-': overloadBuiltin('-', 2, [
    {
      argTypes: ['number', 'number'],
      fnValues: ([a, b]) =>
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
    fn: ([a]) => a.neg(),
    functor: ([n]) => n.isScalar('number'),
  },
  '*': {
    argCount: 2,
    fn: ([a, b]) => getInstanceof(a, Fraction).mul(b),
    functor: ([a, b]) =>
      Type.combine(
        a.isScalar('number'),
        b.isScalar('number'),
        a.multiplyUnit(b.unit)
      ),
  },
  // this is added when we use implicit multiplication instead of '*'
  // there is a separate function because this way we can tell it apart from '*'
  'implicit*': {
    aliasFor: '*',
  },
  '/': {
    argCount: 2,
    fn: ([a, b]) => getInstanceof(a, Fraction).div(b),
    functor: ([a, b]) =>
      Type.combine(
        a.isScalar('number'),
        b.isScalar('number'),
        a.divideUnit(b.unit)
      ),
  },
  '%': {
    argCount: 2,
    fn: ([a, b]) => a.mod(b),
    functor: binopFunctor,
  },
  '**': {
    argCount: 2,
    fn: ([a, b]) => {
      return pow(a, b);
    },
    noAutoconvert: true,
    absoluteNumberInput: true,
    functor: exponentiationFunctor,
  },
  '^': {
    aliasFor: '**',
  },
  smooth: {
    argCount: 2,
    fn: () => 69,
    functor: () => t.number(),
  },
};
