import { buildType as t } from '..';
import { fromJS } from '../interpreter/Value';
import { dimSwapTypes, dimSwapValues } from './dimSwap';

const twoDColumn = t.column(t.column(t.number(), 2, 'X'), 3, 'Y');
const twoDColumnVal = fromJS([
  [1, 2],
  [3, 4],
  [5, 6],
]);

it('does nothing if wanted dimension is already dominant', async () => {
  expect(await dimSwapTypes('Y', twoDColumn)).toEqual(
    t.column(t.column(t.number(), 2, 'X'), 3, 'Y')
  );
});

it('can make a dimension dominant', async () => {
  expect(await dimSwapTypes('X', twoDColumn)).toEqual(
    t.column(t.column(t.number(), 3, 'Y'), 2, 'X')
  );
});

it('can get the value too', async () => {
  expect((await dimSwapValues('X', twoDColumn, twoDColumnVal)).getData())
    .toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(1),
          Fraction(3),
          Fraction(5),
        ],
        Array [
          Fraction(2),
          Fraction(4),
          Fraction(6),
        ],
      ]
    `);

  expect((await dimSwapValues('Y', twoDColumn, twoDColumnVal)).getData())
    .toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(1),
          Fraction(2),
        ],
        Array [
          Fraction(3),
          Fraction(4),
        ],
        Array [
          Fraction(5),
          Fraction(6),
        ],
      ]
    `);
});
