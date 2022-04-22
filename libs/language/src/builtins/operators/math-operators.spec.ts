import { getDefined } from '@decipad/utils';
import { fromJS } from '../../interpreter/Value';
import { InferError, build as t } from '../../type';
import { col, c, n, l, F, U } from '../../utils';
import { mathOperators, mathOperators as operators } from './math-operators';
import { makeContext, inferExpression } from '../../infer';
import { AST } from '../../parser';

describe('math operators', () => {
  it('rounds a number', () => {
    expect(operators.round.functor?.([t.number(U('bananas'))])).toEqual(
      t.number(U('bananas'))
    );
    expect(
      operators.round.fn?.([F(1127, 1000), F(2)], [t.number()]).valueOf()
    ).toBe(1.13);
    expect(
      operators.round.fn?.([F(1127, 10), F(0)], [t.number()]).valueOf()
    ).toBe(113);
  });

  it('rounds a number and decimal units default to 0', () => {
    expect(operators.round.fn?.([F(1127, 10)], [t.number()]).valueOf()).toBe(
      113
    );
  });

  it('rounds down a number with decimal units', () => {
    expect(
      operators.rounddown.fn?.([F(112799, 1000), F(1)], [t.number()]).valueOf()
    ).toBe(112.7);
  });

  it('rounds down a number', () => {
    expect(
      operators.rounddown.fn?.([F(1127, 10)], [t.number()]).valueOf()
    ).toBe(112);
  });

  it('max of a list of numbers', () => {
    expect(operators.max.fnValues?.([fromJS([2, 4, 3])])).toEqual(fromJS(4));
  });

  it('min of a list of numbers', () => {
    expect(operators.min.fnValues?.([fromJS([2, 4, 3])])).toEqual(fromJS(2));
  });

  it('average of a list of numbers', () => {
    expect(operators.average.fnValues?.([fromJS([2, 4, 3])])).toEqual(
      fromJS(3)
    );
  });

  it('averageif: averages the elements against boolean elements in a second list', () => {
    expect(
      operators.averageif.functor!([
        t.column(t.number(), 3),
        t.column(t.boolean(), 3),
      ])
    ).toMatchObject(t.number());

    expect(
      operators.averageif.fnValues?.([
        fromJS([1, 2, 3]),
        fromJS([true, false, true]),
      ])
    ).toMatchInlineSnapshot(`
      FractionValue {
        "value": Fraction(2),
      }
    `);
  });

  it('calculates sqrt', () => {
    expect(operators.sqrt.functor?.([t.number()])).toEqual(t.number());
    expect(operators.sqrt.functor?.([t.number(U('W'))])).toEqual(
      t.number(U('W', { exp: F(1, 2) }))
    );
    expect(operators.sqrt.fn?.([F(4)])).toMatchObject(F(2));
  });

  it("calculates a number's ln", () => {
    expect(operators.ln.fn?.([Math.E])).toBe(1);
  });

  const exponentTestHelper = async (expArg: AST.Expression) => {
    const ctx = makeContext();
    await inferExpression(ctx, expArg);
    return { ctx, expArg };
  };

  it('exponentiates number with unit (1)', async () => {
    const { ctx, expArg } = await exponentTestHelper(l(2));
    expect(
      operators['**'].functor?.(
        [
          t.number([
            {
              unit: 'meters',
              exp: F(1),
              multiplier: F(1),
              known: false,
            },
          ]),
          t.number(),
        ],
        [l(1), expArg],
        ctx
      )
    ).toMatchObject(
      t.number([{ unit: 'meters', exp: F(2), multiplier: F(1), known: false }])
    );
  });

  it('exponentiates number with unit (2)', async () => {
    const { ctx, expArg } = await exponentTestHelper(l('hey'));
    expect(
      operators['**'].functor?.(
        [
          t.number([
            {
              unit: 'meters',
              exp: F(1),
              multiplier: F(1),
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
    const { ctx, expArg } = await exponentTestHelper(
      n('function-call', n('funcref', '+'), n('argument-list', l(2), l(2)))
    );
    expect(
      operators['**'].functor?.(
        [
          t.number([
            {
              unit: 'meters',
              exp: F(1),
              multiplier: F(1),
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
          exp: F(4),
          multiplier: F(1),
          known: false,
        },
      ])
    );
  });

  it('exponentiation allows simple expressions as exponents of unit-ed values', async () => {
    const { ctx, expArg } = await exponentTestHelper(c('/', l(1), l(2)));
    expect(
      operators['**'].functor?.(
        [
          t.number([
            {
              unit: 'meters',
              exp: F(1),
              multiplier: F(1),
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
          exp: F(1, 2),
          multiplier: F(1),
          known: false,
        },
      ])
    );
  });

  it('exponentiation does not allow >0 dimensioned functions as exponents of unit-ed values', async () => {
    const { ctx, expArg } = await exponentTestHelper(
      c('*', col(1, 2, 3), l(2))
    );
    expect(
      operators['**'].functor?.(
        [
          t.number([
            {
              unit: 'meters',
              exp: F(1),
              multiplier: F(1),
              known: false,
            },
          ]),
          t.column(t.number(), 3),
        ],
        [l(30), expArg],
        ctx
      )
    ).toMatchObject(t.impossible(InferError.complexExpressionExponent()));
  });

  it('implements the smooth operator', () => {
    const smooth = getDefined(mathOperators.smooth);
    expect(smooth.functor?.([]).toString()).toMatchInlineSnapshot(`"<number>"`);
    expect(smooth.fn?.([1, 2])).toMatchInlineSnapshot(`69`);
    expect(smooth.fn?.([3, 4])).toMatchInlineSnapshot(`69`);
  });
});
