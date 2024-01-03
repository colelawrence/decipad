/* eslint-disable no-underscore-dangle */
import DeciNumber, { N, ZERO, ONE, TWO } from '@decipad/number';
import { getDefined, produce, getInstanceof } from '@decipad/utils';
import { sort } from '@decipad/column';
// eslint-disable-next-line no-restricted-imports
import {
  InferError,
  RuntimeError,
  Type,
  Value,
  compare,
  buildType as t,
} from '@decipad/language-types';
import { overloadBuiltin } from '../overloadBuiltin';
import { dateOverloads } from '../dateOverloads';
import { BuiltinSpec, Functor } from '../interfaces';
import { coherceToFraction } from '../utils/coherceToFraction';

const binopFunctor = async ([a, b]: Type[]) =>
  Type.combine(a.isScalar('number'), b.sameAs(a));

const removeUnit = produce((t: Type) => {
  if (t.type === 'number') t.unit = null;
});

const exponentiationFunctor: Functor = async ([a, b], values, utils) => {
  const bValue = getDefined(values?.[1]);

  let u: DeciNumber;
  if (a.unit && a.unit.length > 0) {
    try {
      u = coherceToFraction(
        await (await utils.simpleExpressionEvaluate(bValue)).getData()
      );
    } catch (err) {
      if (err instanceof InferError) {
        return t.impossible(err);
      } else {
        throw err;
      }
    }
    return (await binopFunctor([a, removeUnit(b)])).mapType(
      produce((arg1) => {
        for (const unit of arg1.unit ?? []) {
          unit.exp = (unit.exp || N(1)).mul(u);
        }
      })
    );
  } else {
    return binopFunctor([a, removeUnit(b)]);
  }
};

const firstArgumentReducedFunctor = async ([t]: Type[]) => t.reduced();

const max = async ([value]: Value.Value[]): Promise<Value.Value> => {
  let max: Value.Value | undefined;
  if (!Value.isColumnLike(value)) {
    return Promise.resolve(value);
  }

  for await (const val of value.values()) {
    if (max) {
      if (compare(val, max) > 0) {
        max = val;
      }
    } else {
      max = val;
    }
  }
  if (max == null) {
    throw new RuntimeError('max: no elements');
  }
  return max;
};

const min = async ([value]: Value.Value[]): Promise<Value.Value> => {
  let min: Value.Value | undefined;
  if (!Value.isColumnLike(value)) {
    return Promise.resolve(value);
  }
  for await (const val of value.values()) {
    if (min) {
      if (compare(val, min) < 0) {
        min = val;
      }
    } else {
      min = val;
    }
  }
  if (min == null) {
    throw new RuntimeError('min: no elements');
  }
  return min;
};

const average = async ([value]: Value.Value[]): Promise<Value.Value> => {
  let acc = ZERO;
  if (!Value.isColumnLike(value)) {
    return Promise.resolve(value);
  }
  let count = 0n;
  for await (const val of value.values()) {
    count += 1n;
    acc = acc.add(coherceToFraction(await val.getData()));
  }
  return Value.Scalar.fromValue(acc.div(N(count)));
};

const median = async (
  [value]: Value.Value[],
  [type]: Type[] = []
): Promise<Value.Value> => {
  if (!Value.isColumnLike(value)) {
    return Promise.resolve(value);
  }

  const sortedValues = await sort(value, compare);
  const length = await sortedValues.rowCount();
  const rightCenterPos = Math.floor(length / 2);
  const rightCenter = await getDefined(
    await sortedValues.atIndex(rightCenterPos)
  ).getData();
  if (length % 2 === 1) {
    return Value.fromJS(rightCenter, Value.defaultValue(type));
  }
  const leftCenter = coherceToFraction(
    await getDefined(await sortedValues.atIndex(rightCenterPos - 1)).getData()
  );
  return Value.fromJS(
    leftCenter.add(coherceToFraction(rightCenter)).div(TWO),
    Value.defaultValue(type)
  );
};

const stddev = async ([value]: Value.Value[]): Promise<Value.Value> => {
  if (!Value.isColumnLike(value)) {
    return Promise.resolve(Value.NumberValue.fromValue(ZERO));
  }
  const mean = coherceToFraction(await (await average([value])).getData());
  let acc = ZERO;
  let count = 0;
  for await (const val of value.values()) {
    count += 1;
    const n = coherceToFraction(await val.getData());
    const diffSquared = n.sub(mean).pow(TWO);
    acc = acc.add(diffSquared);
  }
  return Value.fromJS(acc.div(N(count)));
};

const secondArgIsPercentage = (types?: Type[]) =>
  types?.[0].numberFormat == null && types?.[1].numberFormat === 'percentage';

export const mathOperators: Record<string, BuiltinSpec> = {
  abs: {
    argCount: 1,
    noAutoconvert: true,
    fnValues: async ([n]) =>
      Value.Scalar.fromValue(coherceToFraction(await n.getData()).abs()),
    functionSignature: 'number:R -> R',
    explanation: 'Absolute value of a number.',
    formulaGroup: 'Numbers',
    syntax: 'abs(Number)',
    example: 'abs(-$300)',
  },
  max: {
    argCount: 1,
    argCardinalities: [2],
    isReducer: true,
    functor: firstArgumentReducedFunctor,
    fnValues: max,
    explanation: 'Maximum value of a column.',
    syntax: 'max(Table.Column)',
    formulaGroup: 'Columns',
    example: 'max(Prices.Discount)',
  },
  min: {
    argCount: 1,
    argCardinalities: [2],
    isReducer: true,
    functor: firstArgumentReducedFunctor,
    fnValues: min,
    explanation: 'Minimum value of a column.',
    syntax: 'min(Table.Column)',
    example: 'min(Prices.Discount)',
    formulaGroup: 'Columns',
  },
  average: {
    argCount: 1,
    argCardinalities: [2],
    isReducer: true,
    fnValues: average,
    functionSignature: 'column<R> -> R',
    explanation: 'Average of a column.',
    syntax: 'average(Table.Column)',
    example: 'average(Prices.Discount)',
    formulaGroup: 'Columns',
  },
  avg: {
    aliasFor: 'average',
    explanation: 'Average of a column.',
    syntax: 'avg(Table.Column)',
    example: 'avg(Prices.Discount)',
    formulaGroup: 'Columns',
  },
  mean: {
    aliasFor: 'average',
    explanation: 'Average of a column.',
    syntax: 'mean(Table.Column)',
    example: 'mean(Prices.Discount)',
    formulaGroup: 'Columns',
  },
  averageif: {
    argCount: 2,
    noAutoconvert: true,
    argCardinalities: [2, 2],
    fnValues: async ([numbers, bools]: Value.Value[]) => {
      let acc = ZERO;
      if (!Value.isColumnLike(numbers)) {
        return numbers;
      }
      if (!Value.isColumnLike(bools)) {
        throw new Error('expected booleans to be a column');
      }
      const boolsIt = bools.values();
      let count = 0n;
      for await (const val of numbers.values()) {
        const b = await boolsIt.next();
        if (b.done) {
          throw new Error('booleans and values should have the same length');
        }
        if (await b.value.getData()) {
          count += 1n;
          acc = acc.add(coherceToFraction(await val.getData()));
        }
      }
      return Value.Scalar.fromValue(acc.div(N(count)));
    },
    functor: async ([numbers, booleans]) =>
      Type.combine(
        (await booleans.reduced()).isScalar('boolean'),
        (await numbers.reduced()).isScalar('number')
      ),
    explanation: 'Averages all the elements of a column that match condition.',
    formulaGroup: 'Columns',
    syntax: 'avgif(Column)',
    example: 'avgif(Sales.Prices >= $100)',
  },
  avgif: { aliasFor: 'averageif' },
  meanif: { aliasFor: 'averageif' },
  median: {
    argCount: 1,
    argCardinalities: [2],
    isReducer: true,
    fnValues: median,
    functionSignature: 'column<R> -> R',
    explanation: 'Median of a column.',
    syntax: 'median(Table.Column)',
    formulaGroup: 'Columns',
    example: 'median(Prices.Discount)',
  },
  stddev: {
    argCount: 1,
    argCardinalities: [2],
    isReducer: true,
    fnValues: stddev,
    functionSignature: 'column<R> -> R',
    explanation: 'Standard deviation of a column.',
    syntax: 'stddev(Table.Column)',
    formulaGroup: 'Columns',
    example: 'stddev(Prices.Discount)',
  },
  variance: {
    aliasFor: 'stddev',
    explanation: 'Standard deviation of a column.',
    syntax: 'variance(Table.Column)',
    formulaGroup: 'Columns',
    example: 'variance(Prices.Discount)',
  },
  sqrt: {
    argCount: 1,
    fn: ([n]) => {
      let result: DeciNumber | undefined;
      try {
        result = coherceToFraction(n).pow(N(1, 2));
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
        result = N(nonRationalResult);
      }
      return result;
    },
    functor: async ([n]) => Type.combine(n.isScalar('number'), n.divideUnit(2)),
    explanation: 'Square root of your number.',
    formulaGroup: 'Numbers',
    syntax: 'sqrt(Number)',
    example: 'sqrt(9ft)',
  },
  ln: {
    argCount: 1,
    noAutoconvert: true,
    fn: ([n]) => Math.log(n),
    functionSignature: 'number:R -> R',
    explanation: 'Natural logarithmic of a number.',
    formulaGroup: 'Numbers',
    syntax: 'ln(Number)',
    example: 'ln(1)',
  },
  factorial: {
    argCount: 1,
    fnValues: (() => {
      const lookupTable = Array(100_000);

      return async ([n]) => {
        const frac = getInstanceof(await n.getData(), DeciNumber);

        if (frac.compare(ZERO) < 0) {
          throw new RuntimeError(
            'factorial() requires a positive number or zero'
          );
        }

        if (frac.compare(N(100000)) > 0) {
          throw new RuntimeError('factorial() number too large');
        }

        if (frac.compare(TWO) < 0) {
          return new Value.NumberValue(ONE);
        }

        if (frac.valueOf() !== Math.round(frac.valueOf())) {
          throw new RuntimeError('factorial() number not an integer');
        }

        if (lookupTable[frac.valueOf()]) {
          return new Value.NumberValue(N(lookupTable[frac.valueOf()]));
        }

        let i = BigInt(frac.valueOf() - 1);
        let fact = BigInt(frac.valueOf());
        for (; i >= 1; i--) {
          fact *= i;
        }

        lookupTable[frac.valueOf()] = fact;

        return new Value.NumberValue(N(fact));
      };
    })(),
    functor: ([n]) => n,
    explanation: 'Factorial of a number.',
    syntax: 'factorial(Number)',
    example: 'factorial(5)',
    formulaGroup: 'Numbers',
  },
  '+': overloadBuiltin(
    '+',
    2,
    [
      {
        argTypes: ['number', 'number'],
        fnValues: async ([n1, n2], types) => {
          if (secondArgIsPercentage(types)) {
            return Value.Scalar.fromValue(
              coherceToFraction(await n1.getData()).mul(
                coherceToFraction(await n2.getData()).add(ONE)
              )
            );
          }

          return Value.Scalar.fromValue(
            coherceToFraction(await n1.getData()).add(
              coherceToFraction(await n2.getData())
            )
          );
        },
        functor: binopFunctor,
      },
      {
        argTypes: ['string', 'string'],
        fnValues: async ([n1, n2]) =>
          Value.Scalar.fromValue(
            String(await n1.getData()) + String(await n2.getData())
          ),
        functor: async ([a, b]) =>
          Type.combine(a.isScalar('string'), b.isScalar('string')),
      },
      ...dateOverloads['+'],
    ],
    'infix'
  ),
  '-': overloadBuiltin(
    '-',
    2,
    [
      {
        argTypes: ['number', 'number'],
        fnValues: async ([a, b], types) => {
          if (secondArgIsPercentage(types)) {
            return Value.Scalar.fromValue(
              coherceToFraction(await a.getData()).mul(
                ONE.sub((await b.getData()) as DeciNumber)
              )
            );
          }

          return Value.Scalar.fromValue(
            coherceToFraction(await a.getData()).sub(
              (await b.getData()) as DeciNumber
            )
          );
        },
        functor: binopFunctor,
      },
      ...dateOverloads['-'],
    ],
    'infix'
  ),
  'unary-': {
    argCount: 1,
    noAutoconvert: true,
    fn: ([a]) => a.neg(),
    functionSignature: 'number:R -> R',
    operatorKind: 'prefix',
  },
  '*': {
    argCount: 2,
    fn: ([a, b]) => getInstanceof(a, DeciNumber).mul(b),
    functor: async ([a, b]) =>
      Type.combine(
        a.isScalar('number'),
        b.isScalar('number'),
        (await a.sharePercentage(b)).multiplyUnit(b.unit)
      ),
    operatorKind: 'infix',
  },
  // this is added when we use implicit multiplication instead of '*'
  // there is a separate function because this way we can tell it apart from '*'
  'implicit*': {
    aliasFor: '*',
    operatorKind: 'prefix',
  },
  for: {
    aliasFor: '*',
    operatorKind: 'infix',
  },
  '/': {
    argCount: 2,
    fn: ([a, b]) => getInstanceof(a, DeciNumber).div(b),
    functor: async ([a, b]) =>
      Type.combine(
        a.isScalar('number'),
        b.isScalar('number'),
        (await a.sharePercentage(b)).divideUnit(b.unit)
      ),
    operatorKind: 'infix',
  },
  per: {
    aliasFor: '/',
    operatorKind: 'infix',
  },
  mod: {
    argCount: 2,
    fn: ([a, b]) => a.mod(b),
    functor: binopFunctor,
    operatorKind: 'infix',
    explanation: 'Remainder when dividing.',
    formulaGroup: 'Numbers',
    syntax: 'Number mod Number',
    example: '5 mod 2',
  },
  modulo: {
    aliasFor: 'mod',
    operatorKind: 'infix',
    explanation: 'Remainder when dividing.',
    formulaGroup: 'Numbers',
    syntax: 'Number modulo Number',
    example: '5 modulo 2',
  },
  '**': {
    argCount: 2,
    fn: ([a, b]) => getInstanceof(a, DeciNumber).pow(b),
    noAutoconvert: true,
    absoluteNumberInput: true,
    functor: exponentiationFunctor,
    operatorKind: 'infix',
  },
  '^': {
    aliasFor: '**',
  },
  smooth: {
    hidden: true,
    argCount: 2,
    fn: () => 69,
    functor: () => t.number(),
  },
};
