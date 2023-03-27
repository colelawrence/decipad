import { buildType as t } from '..';
import { ColumnLike, fromJS } from '../value';
import { dimSwapTypes, dimSwapValues } from './dimSwap';

const twoDColumn = t.column(t.column(t.number(), 'X'), 'Y');
const twoDColumnVal = fromJS([
  [1n, 2n],
  [3n, 4n],
  [5n, 6n],
]) as ColumnLike;

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

it('can get the value too', async () => {
  expect((await dimSwapValues('X', twoDColumn, twoDColumnVal)).getData())
    .toMatchInlineSnapshot(`
    Array [
      Array [
        DeciNumber(1),
        DeciNumber(3),
        DeciNumber(5),
      ],
      Array [
        DeciNumber(2),
        DeciNumber(4),
        DeciNumber(6),
      ],
    ]
  `);

  expect((await dimSwapValues('Y', twoDColumn, twoDColumnVal)).getData())
    .toMatchInlineSnapshot(`
    Array [
      Array [
        DeciNumber(1),
        DeciNumber(2),
      ],
      Array [
        DeciNumber(3),
        DeciNumber(4),
      ],
      Array [
        DeciNumber(5),
        DeciNumber(6),
      ],
    ]
  `);
});
