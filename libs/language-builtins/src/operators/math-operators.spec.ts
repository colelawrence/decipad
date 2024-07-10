import { describe, it, expect } from 'vitest';
import { N, setupDeciNumberSnapshotSerializer } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import { InferError, Value, buildType as t } from '@decipad/language-types';
import { mathOperators as operators } from './math-operators';
import { U, makeContext, l, n, c, col } from '../utils/testUtils';
import type { FullBuiltinSpec } from '../types';

setupDeciNumberSnapshotSerializer();

describe('math operators', () => {
  it('max of a list of numbers', async () => {
    expect(
      await (operators.max as FullBuiltinSpec).fnValues?.(
        [Value.fromJS([2, 4, 3])],
        [],
        makeContext(),
        []
      )
    ).toEqual(Value.fromJS(4));
  });

  it('min of a list of numbers', async () => {
    expect(
      await (operators.min as FullBuiltinSpec).fnValues?.(
        [Value.fromJS([2, 4, 3])],
        [],
        makeContext(),
        []
      )
    ).toEqual(Value.fromJS(2));
  });

  it('average of a list of numbers', async () => {
    expect(
      await (operators.average as FullBuiltinSpec).fnValues?.(
        [Value.fromJS([2, 4, 3])],
        [],
        makeContext(),
        []
      )
    ).toEqual(Value.fromJS(3));
  });

  it('averageif: averages the elements against boolean elements in a second list', async () => {
    expect(
      await (operators.averageif as FullBuiltinSpec).functor!(
        [t.column(t.number()), t.column(t.boolean())],
        [],
        makeContext()
      )
    ).toMatchObject(t.number());

    expect(
      await (operators.averageif as FullBuiltinSpec).fnValues?.(
        [Value.fromJS([1, 2, 3]), Value.fromJS([true, false, true])],
        [],
        makeContext(),
        []
      )
    ).toMatchInlineSnapshot(`
      NumberValue {
        "value": DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        },
      }
    `);
  });

  it('median of a list of numbers', async () => {
    expect(
      await (operators.median as FullBuiltinSpec).fnValues?.(
        [Value.fromJS([3, 4, 2])],
        [],
        makeContext(),
        []
      )
    ).toEqual(Value.fromJS(3));
    expect(
      await (operators.median as FullBuiltinSpec).fnValues?.(
        [Value.fromJS([3, 4, 2, 5])],
        [],
        makeContext(),
        []
      )
    ).toEqual(Value.fromJS(3.5));
  });

  it('calculates sqrt', async () => {
    expect(
      await (operators.sqrt as FullBuiltinSpec).functor?.(
        [t.number()],
        [],
        makeContext()
      )
    ).toEqual(t.number());
    expect(
      await (operators.sqrt as FullBuiltinSpec).functor?.(
        [t.number(U('W'))],
        [],
        makeContext()
      )
    ).toEqual(t.number(U('W', { exp: N(1, 2) })));
    expect(
      await (operators.sqrt as FullBuiltinSpec).fn?.([N(4)])
    ).toMatchObject(N(2));
  });

  it("calculates a number's ln", async () => {
    expect(await (operators.ln as FullBuiltinSpec).fn?.([Math.E])).toBe(1);
  });

  it('exponentiates number with unit (1)', async () => {
    const expArg = l(2);
    const ctx = makeContext();
    ctx.simpleExpressionEvaluate = async () =>
      Promise.resolve(new Value.NumberValue(2));
    expect(
      await (operators['**'] as FullBuiltinSpec).functor?.(
        [
          t.number([
            {
              unit: 'meters',
              exp: N(1),
              multiplier: N(1),
              known: false,
            },
          ]),
          t.number(),
        ],
        [l(1), expArg],
        ctx
      )
    ).toMatchObject(
      t.number([{ unit: 'meters', exp: N(2), multiplier: N(1), known: false }])
    );
  });

  it('exponentiates number with unit (2)', async () => {
    const expArg = l('hey');
    const ctx = makeContext();
    ctx.simpleExpressionEvaluate = async () => {
      throw InferError.expectedButGot('number', 'string');
    };

    expect(
      await (operators['**'] as FullBuiltinSpec).functor?.(
        [
          t.number([
            {
              unit: 'meters',
              exp: N(1),
              multiplier: N(1),
              known: false,
            },
          ]),
          t.number(),
        ],
        [l(1), expArg],
        ctx
      )
    ).toMatchObject(
      t.impossible(InferError.expectedButGot('number', 'string'))
    );
  });

  it('exponentiates number with unit (3)', async () => {
    const expArg = n(
      'function-call',
      n('funcref', '+'),
      n('argument-list', l(2), l(2))
    );
    const ctx = makeContext();
    ctx.simpleExpressionEvaluate = async () =>
      Promise.resolve(new Value.NumberValue(4));
    expect(
      await (operators['**'] as FullBuiltinSpec).functor?.(
        [
          t.number([
            {
              unit: 'meters',
              exp: N(1),
              multiplier: N(1),
              known: false,
            },
          ]),
          t.number(),
        ],
        [l(1), expArg],
        ctx
      )
    ).toEqual(
      t.number([
        {
          unit: 'meters',
          exp: N(4),
          multiplier: N(1),
          known: false,
        },
      ])
    );
  });

  it('exponentiation allows simple expressions as exponents of unit-ed values', async () => {
    const expArg = c('/', l(1), l(2));
    const ctx = makeContext();
    ctx.simpleExpressionEvaluate = async () =>
      Promise.resolve(new Value.NumberValue(N(1, 2)));
    expect(
      await (operators['**'] as FullBuiltinSpec).functor?.(
        [
          t.number([
            {
              unit: 'meters',
              exp: N(1),
              multiplier: N(1),
              known: false,
            },
          ]),
          t.number(),
        ],
        [l(30), expArg],
        ctx
      )
    ).toEqual(
      t.number([
        {
          unit: 'meters',
          exp: N(1, 2),
          multiplier: N(1),
          known: false,
        },
      ])
    );
  });

  it('exponentiation does not allow >0 dimensioned functions as exponents of unit-ed values', async () => {
    const expArg = c('*', col(1, 2, 3), l(2));
    const ctx = makeContext();
    ctx.simpleExpressionEvaluate = () => {
      throw InferError.complexExpressionExponent();
    };
    expect(
      await (operators['**'] as FullBuiltinSpec).functor?.(
        [
          t.number([
            {
              unit: 'meters',
              exp: N(1),
              multiplier: N(1),
              known: false,
            },
          ]),
          t.column(t.number()),
        ],
        [l(30), expArg],
        ctx
      )
    ).toMatchObject(t.impossible(InferError.complexExpressionExponent()));
  });
});
