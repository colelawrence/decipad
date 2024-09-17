/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
import type { DeciNumberBase } from '@decipad/number';
import DeciNumber, { N, ZERO, ONE, TWO } from '@decipad/number';
import { getDefined, produce, getInstanceof } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import {
  InferError,
  RuntimeError,
  Type,
  Value,
  buildType as t,
  serializeType,
  resultToValue,
} from '@decipad/language-types';
import type { Value as ValueTypes } from '@decipad/language-interfaces';
import { FullBuiltinSpec, type BuiltinSpec, type Functor } from '../types';
import { coerceToFraction } from '../utils/coerceToFraction';
import { binopFunctor } from '../utils/binopFunctor';
import { add } from './add';
import { subtract } from './subtract';
import { mult } from './mult';
import { div } from './div';
import {
  computeBackendSingleton,
  serializeResult,
  deserializeResult,
} from '@decipad/compute-backend-js';
import { createWasmEvaluator } from './wasm-evaluator';

const removeUnit = produce((t: Type) => {
  if (t.type === 'number') t.unit = null;
});

const exponentiationFunctor: Functor = async ([a, b], values, utils) => {
  const bValue = getDefined(values?.[1]);

  let u: DeciNumberBase;
  if (a.unit && a.unit.length > 0) {
    try {
      u = coerceToFraction(
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

const max: FullBuiltinSpec['fnValues'] = createWasmEvaluator(
  (id) => computeBackendSingleton.computeBackend.max(id),
  (res) => Value.Scalar.fromValue(res.value as DeciNumber),
  async ([value], [valueType]): Promise<ValueTypes.Value> => {
    const column = Value.getColumnLike(value);

    const col = await serializeResult({
      type: serializeType(valueType),
      value: await column.getData(),
    });

    const max =
      computeBackendSingleton.computeBackend.max_result_fraction_column(col);

    return resultToValue(deserializeResult(max as any));
  }
);

const min: FullBuiltinSpec['fnValues'] = createWasmEvaluator(
  (id) => computeBackendSingleton.computeBackend.min(id),
  (res) => Value.Scalar.fromValue(res.value as DeciNumber),
  async ([value], [valueType]): Promise<ValueTypes.Value> => {
    const column = Value.getColumnLike(value);

    const col = await serializeResult({
      type: serializeType(valueType),
      value: await column.getData(),
    });

    const max =
      computeBackendSingleton.computeBackend.min_result_fraction_column(col);

    return resultToValue(deserializeResult(max as any));
  }
);

const average: FullBuiltinSpec['fnValues'] = createWasmEvaluator(
  (id) => computeBackendSingleton.computeBackend.average(id),
  (res) => Value.Scalar.fromValue(res.value as DeciNumber),
  async ([value]: ValueTypes.Value[]): Promise<ValueTypes.Value> => {
    let acc = ZERO;
    if (!Value.isColumnLike(value)) {
      return Promise.resolve(value);
    }
    let count = 0n;
    for await (const val of value.values()) {
      count += 1n;
      acc = acc.add(coerceToFraction(await val.getData()));
    }
    return Value.Scalar.fromValue(acc.div(N(count)));
  }
);

const median: FullBuiltinSpec['fnValues'] = createWasmEvaluator(
  (id) => computeBackendSingleton.computeBackend.median(id),
  (res) => Value.Scalar.fromValue(res.value as DeciNumber),
  async ([value], [valueType]): Promise<ValueTypes.Value> => {
    const column = Value.getColumnLike(value);

    const col = await serializeResult({
      type: serializeType(valueType),
      value: await column.getData(),
    });

    const max =
      computeBackendSingleton.computeBackend.median_result_fraction_column(col);

    return resultToValue(deserializeResult(max as any));
  }
);

const stddev: FullBuiltinSpec['fnValues'] = async (
  [value],
  [valueType],
  utils,
  ast
): Promise<ValueTypes.Value> => {
  if (!Value.isColumnLike(value)) {
    return Promise.resolve(Value.NumberValue.fromValue(ZERO));
  }
  const mean = coerceToFraction(
    await (await average([value], [valueType], utils, ast)).getData()
  );
  let acc = ZERO;
  let count = 0;
  for await (const val of value.values()) {
    count += 1;
    const n = coerceToFraction(await val.getData());
    const diffSquared = n.sub(mean).pow(TWO);
    acc = acc.add(diffSquared);
  }
  return Value.fromJS(acc.div(N(count)));
};

export const mathOperators: Record<string, BuiltinSpec> = {
  abs: {
    argCount: 1,
    noAutoconvert: true,
    fnValues: async ([n]) =>
      Value.Scalar.fromValue(coerceToFraction(await n.getData()).abs()),
    functionSignature: 'number:R -> R',
    explanation: 'Absolute value of a number.',
    formulaGroup: 'Numbers',
    syntax: 'abs(Number)',
    example: 'abs(-$300)',
    toMathML: ([n]) => `<mo>|</mo>${n}<mo>|</mo>`,
  },
  max: {
    argCount: 1,
    argCardinalities: [[2]],
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
    argCardinalities: [[2]],
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
    argCardinalities: [[2]],
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
    argCardinalities: [[2, 2]],
    fnValues: async ([numbers, bools]: ValueTypes.Value[]) => {
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
          acc = acc.add(coerceToFraction(await val.getData()));
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
    argCardinalities: [[2]],
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
    argCardinalities: [[2]],
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
      let result: DeciNumberBase | undefined;
      try {
        result = coerceToFraction(n).pow(N(1, 2));
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
    toMathML: ([n]) => `<msqrt>${n}</msqrt>`,
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
  '+': {
    ...add,
    toMathML: ([a, b]) => `<mo>(</mo>${a}<mo>+</mo>${b}<mo>)</mo>`,
  },
  '-': {
    ...subtract,
    toMathML: ([a, b]) => `<mo>(</mo>${a}<mo>-</mo>${b}<mo>)</mo>`,
  },
  'unary-': {
    argCount: 1,
    noAutoconvert: true,
    fn: ([a]) => a.neg(),
    functionSignature: 'number:R -> R',
    operatorKind: 'prefix',
  },
  '*': {
    ...mult,
    toMathML: ([a, b]) => `${a}<mo>*</mo>${b}`,
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
    ...div,
    toMathML: ([a, b]) => `<mfrac>
      <mrow>${a}</mrow>
      <mrow>${b}</mrow>
    </mfrac>`,
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
    toMathML: ([a, b]) => `${a}<mspace /><mo>mod</mo><mspace />${b}`,
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
    formulaGroup: 'Numbers',
    toMathML: ([a, b]) =>
      `<msup><mrow><mo>(</mo>${a}<mo>)</mo></mrow>${b}</msup>`,
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
