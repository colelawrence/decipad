import {
  evaluateMatrixAssign,
  evaluateMatrixRef,
  inferMatrixRef,
  inferMatrixAssign,
} from '.';
import { Context, makeContext } from '..';
import { Realm } from '../interpreter';
import { fromJS } from '../value';
import { build as t, InferError } from '../type';
import { c, col, l, matrixAssign, matrixRef, r } from '../utils';

let testRealm: Realm;
let testContext: Context;
beforeEach(async () => {
  testContext = makeContext({
    initialGlobalScope: {
      City: t.column(t.string(), 2, 'City'),
      OtherDimension: t.column(t.string(), 2, 'OtherDimension'),
      CoffeePrice: t.column(t.number(), 2, 'City'),
    },
  });

  testRealm = new Realm(testContext);
  testRealm.stack.set('City', fromJS(['Lisbon', 'Faro']));
  testRealm.stack.set('CoffeePrice', fromJS([70, 90]));
});

describe('matrix op evaluation', () => {
  it('gets the values of a match', async () => {
    expect(
      (
        await evaluateMatrixRef(
          testRealm,
          matrixRef('CoffeePrice', [r('City')])
        )
      ).getData()
    ).toMatchInlineSnapshot(`
      Array [
        Fraction(70),
        Fraction(90),
      ]
    `);

    expect(
      (
        await evaluateMatrixRef(
          testRealm,
          matrixRef('CoffeePrice', [c('==', r('City'), l('Lisbon'))])
        )
      ).getData()
    ).toMatchInlineSnapshot(`
      Array [
        Fraction(70),
      ]
    `);
  });

  it('can be used to create a variable (runtime)', async () => {
    expect(
      (
        await evaluateMatrixAssign(
          testRealm,
          matrixAssign('UnknownVar', [r('City')], l(123))
        )
      ).getData()
    ).toMatchInlineSnapshot(`
      Array [
        Fraction(123),
        Fraction(123),
      ]
    `);
  });

  it('updates the values of a match', async () => {
    expect(
      (
        await evaluateMatrixAssign(
          testRealm,
          matrixAssign('CoffeePrice', [c('==', r('City'), l('Lisbon'))], l(123))
        )
      ).getData()
    ).toMatchInlineSnapshot(`
      Array [
        Fraction(123),
        Fraction(90),
      ]
    `);
  });
});

describe('matrix op inference', () => {
  it('infers the result of a match', async () => {
    expect(
      await inferMatrixRef(
        testContext,
        matrixRef('CoffeePrice', [c('==', r('City'), l('Lisbon'))])
      )
    ).toMatchObject({
      columnSize: 'unknown',
      cellType: { type: 'number' },
    });
  });

  it('propagates inference errors', async () => {
    expect(
      await inferMatrixRef(
        testContext,
        matrixRef('MissingVar', [c('==', r('City'), l('Lisbon'))])
      )
    ).toMatchObject(t.impossible(InferError.missingVariable('MissingVar')));
  });

  it('infers the matchers within', async () => {
    expect(
      await inferMatrixRef(
        testContext,
        matrixRef('CoffeePrice', [c('==', r('MissingVar'), l('Lisbon'))])
      )
    ).toMatchObject(t.impossible(InferError.missingVariable('MissingVar')));

    const typeErrorAST = c('+', l('str'), l(1));

    expect(
      await inferMatrixRef(
        testContext,
        matrixRef('CoffeePrice', [c('==', r('City'), typeErrorAST)])
      )
    ).toMatchObject({
      errorCause: {
        spec: {
          errType: 'bad-overloaded-builtin-call',
        },
      },
    });

    expect(
      await inferMatrixRef(
        testContext,
        matrixRef('CoffeePrice', [c('==', r('City'), l(1))])
      )
    ).toMatchObject({
      errorCause: {
        spec: {
          errType: 'expected-but-got',
        },
      },
    });
  });

  it('ensures new matrix content matches the existing content', async () => {
    expect(
      await inferMatrixAssign(
        testContext,
        matrixAssign(
          'CoffeePrice',
          [c('==', r('City'), l('Lisbon'))],
          l('other type')
        )
      )
    ).toMatchObject({
      errorCause: {
        spec: {
          errType: 'expected-but-got',
        },
      },
    });
  });

  it('ensures matcher has the correct dimension', async () => {
    expect(
      await inferMatrixAssign(
        testContext,
        matrixAssign(
          'CoffeePrice',
          [c('==', r('OtherDimension'), l('Lisbon'))],
          l(1)
        )
      )
    ).toMatchObject({
      errorCause: {
        spec: {
          errType: 'expected-table-and-associated-column',
        },
      },
    });

    expect(
      await inferMatrixAssign(
        testContext,
        matrixAssign(
          'CoffeePrice',
          [c('==', r('UnknownDimension'), l('Lisbon'))],
          l(1)
        )
      )
    ).toMatchObject({
      errorCause: {
        spec: {
          errType: 'expected-table-and-associated-column',
        },
      },
    });
  });

  it('can be used to create a variable', async () => {
    const newVariable = await inferMatrixAssign(
      testContext,
      matrixAssign('CreatedVar', [r('City')], l(1))
    );
    expect(newVariable).toMatchObject({
      indexedBy: 'City',
      cellType: { type: 'number' },
    });
    expect(testContext.stack.get('CreatedVar')).toBe(newVariable);
  });

  it('ensures the dimension exists', async () => {
    expect(
      await inferMatrixAssign(
        testContext,
        matrixAssign('CreatedVar', [r('UnknownSet')], l(1))
      )
    ).toMatchObject({
      errorCause: {
        spec: {
          errType: 'missing-variable',
          missingVariable: ['UnknownSet'],
        },
      },
    });
  });
});

describe('assigning multidimensional values', () => {
  it('can eval simple assignment', async () => {
    expect(
      (
        await evaluateMatrixAssign(
          testRealm,
          matrixAssign('CoffeePrice', [r('City')], col(1, 2))
        )
      ).getData()
    ).toMatchInlineSnapshot(`
      Array [
        Fraction(1),
        Fraction(2),
      ]
    `);
  });

  it('can eval filtered assignment', async () => {
    expect(
      (
        await evaluateMatrixAssign(
          testRealm,
          matrixAssign('CoffeePrice', [c('==', r('City'), l('Faro'))], col(150))
        )
      ).getData()
    ).toMatchInlineSnapshot(`
      Array [
        Fraction(70),
        Fraction(150),
      ]
    `);
  });

  it('can infer simple assignment', async () => {
    expect(
      await inferMatrixAssign(
        testContext,
        matrixAssign('CoffeePrice', [r('City')], col(1, 2))
      )
    ).toMatchObject({
      cellType: { type: 'number' },
      indexedBy: 'City',
    });
  });

  it('can infer filtered assignment', async () => {
    expect(
      await inferMatrixAssign(
        testContext,
        matrixAssign('CoffeePrice', [c('==', r('City'), l('Faro'))], col(123))
      )
    ).toMatchObject({
      cellType: { type: 'number' },
      indexedBy: 'City',
    });
  });
});
