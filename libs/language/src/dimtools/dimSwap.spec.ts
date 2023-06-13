import { setupDeciNumberSnapshotSerializer } from '@decipad/number';
import { buildType as t } from '..';
import { materializeOneResult } from '../utils/materializeOneResult';
import { ColumnLikeValue, fromJS } from '../value';
import { dimSwapTypes, dimSwapValues } from './dimSwap';

setupDeciNumberSnapshotSerializer();

const twoDColumn = t.column(t.column(t.number(), 'X'), 'Y');
const twoDColumnVal = fromJS([
  [1n, 2n],
  [3n, 4n],
  [5n, 6n],
]) as ColumnLikeValue;

it('does nothing if wanted dimension is already dominant', async () => {
  expect(await dimSwapTypes('Y', twoDColumn)).toEqual(
    t.column(t.column(t.number(), 'X'), 'Y')
  );
});

it('can make a dimension dominant', async () => {
  expect(await dimSwapTypes('X', twoDColumn)).toEqual(
    t.column(t.column(t.number(), 'Y'), 'X')
  );
});

it('can get the value too (1)', async () => {
  expect(
    await materializeOneResult(
      (await dimSwapValues('Y', twoDColumn, twoDColumnVal)).getData()
    )
  ).toMatchInlineSnapshot(`
    Array [
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
      ],
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 3n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 4n,
          "s": 1n,
        },
      ],
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 6n,
          "s": 1n,
        },
      ],
    ]
  `);
});

it('can get the value too (2)', async () => {
  expect(
    await materializeOneResult(
      (await dimSwapValues('X', twoDColumn, twoDColumnVal)).getData()
    )
  ).toMatchInlineSnapshot(`
    Array [
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
          "n": 3n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 5n,
          "s": 1n,
        },
      ],
      Array [
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 2n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 4n,
          "s": 1n,
        },
        DeciNumber {
          "d": 1n,
          "infinite": false,
          "n": 6n,
          "s": 1n,
        },
      ],
    ]
  `);
});
