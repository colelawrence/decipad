import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
import {
  InferError,
  materializeOneResult,
  buildType as t,
  Value,
} from '@decipad/language-types';
import {
  evaluateMatrixAssign,
  evaluateMatrixRef,
  inferMatrixRef,
  inferMatrixAssign,
} from '.';
import { c, col, l, matrixAssign, matrixRef, r } from '../utils';
import type { ScopedInferContext } from '../scopedRealm';
import { makeInferContext, ScopedRealm } from '../scopedRealm';

setupDeciNumberSnapshotSerializer();

let testRealm: ScopedRealm;
let testContext: ScopedInferContext;
beforeEach(() => {
  testContext = makeInferContext({
    initialGlobalScope: {
      City: t.column(t.string(), 'City'),
      OtherDimension: t.column(t.string(), 'OtherDimension'),
      CoffeePrice: t.column(t.number(), 'City'),
    },
  });

  testRealm = new ScopedRealm(undefined, testContext);
  testRealm.stack.set('City', Value.fromJS(['Lisbon', 'Faro']));
  testRealm.stack.set('CoffeePrice', Value.fromJS([70, 90]));
});

describe('matrix op evaluation', () => {
  it('gets the values of a match', async () => {
    expect(
      await materializeOneResult(
        (
          await evaluateMatrixRef(
            testRealm,
            matrixRef('CoffeePrice', [r('City')])
          )
        ).getData()
      )
    ).toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 70n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 90n,
          "s": 1n,
        },
      ]
    `);

    expect(
      await materializeOneResult(
        (
          await evaluateMatrixRef(
            testRealm,
            matrixRef('CoffeePrice', [c('==', r('City'), l('Lisbon'))])
          )
        ).getData()
      )
    ).toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 70n,
          "s": 1n,
        },
      ]
    `);
  });

  it('can be used to create a variable (runtime)', async () => {
    expect(
      await materializeOneResult(
        await (
          await evaluateMatrixAssign(
            testRealm,
            matrixAssign('UnknownVar', [r('City')], l(123))
          )
        ).getData()
      )
    ).toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 123n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 123n,
          "s": 1n,
        },
      ]
    `);
  });

  it('updates the values of a match', async () => {
    expect(
      await materializeOneResult(
        await (
          await evaluateMatrixAssign(
            testRealm,
            matrixAssign(
              'CoffeePrice',
              [c('==', r('City'), l('Lisbon'))],
              l(123)
            )
          )
        ).getData()
      )
    ).toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 123n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 90n,
          "s": 1n,
        },
      ]
    `);
  });
});

describe('matrix op inference', () => {
  it('infers the result of a match', async () => {
    expect(
      await inferMatrixRef(
        testRealm,
        matrixRef('CoffeePrice', [c('==', r('City'), l('Lisbon'))])
      )
    ).toMatchObject({
      cellType: { type: 'number' },
    });
  });

  it('propagates inference errors', async () => {
    expect(
      await inferMatrixRef(
        testRealm,
        matrixRef('MissingVar', [c('==', r('City'), l('Lisbon'))])
      )
    ).toMatchObject(t.impossible(InferError.missingVariable('MissingVar')));
  });

  it('infers the matchers within', async () => {
    expect(
      await inferMatrixRef(
        testRealm,
        matrixRef('CoffeePrice', [c('==', r('MissingVar'), l('Lisbon'))])
      )
    ).toMatchObject(t.impossible(InferError.missingVariable('MissingVar')));

    const typeErrorAST = c('+', l('str'), l(1));

    expect(
      await inferMatrixRef(
        testRealm,
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
        testRealm,
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
        testRealm,
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
        testRealm,
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
        testRealm,
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
      testRealm,
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
        testRealm,
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
    const assign = matrixAssign('CoffeePrice', [r('City')], col(1, 2));
    await inferMatrixAssign(testRealm, assign);
    expect(
      await materializeOneResult(
        await (await evaluateMatrixAssign(testRealm, assign)).getData()
      )
    ).toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 1n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        },
      ]
    `);
  });

  it('can eval filtered assignment', async () => {
    const assign = matrixAssign(
      'CoffeePrice',
      [c('==', r('City'), l('Faro'))],
      col(150)
    );
    await inferMatrixAssign(testRealm, assign);
    expect(
      await materializeOneResult(
        await (await evaluateMatrixAssign(testRealm, assign)).getData()
      )
    ).toMatchInlineSnapshot(`
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 70n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 150n,
          "s": 1n,
        },
      ]
    `);
  });

  it('can infer simple assignment', async () => {
    expect(
      await inferMatrixAssign(
        testRealm,
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
        testRealm,
        matrixAssign('CoffeePrice', [c('==', r('City'), l('Faro'))], col(123))
      )
    ).toMatchObject({
      cellType: { type: 'number' },
      indexedBy: 'City',
    });
  });
});
