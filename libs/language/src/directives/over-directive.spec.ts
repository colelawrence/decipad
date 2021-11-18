import { buildType as t } from '..';
import { genericIdent, indexedCol } from '../utils';
import { over } from './over-directive';
import { testGetType, testGetValue } from './testUtils';

const { getType, getValue } = over;
const twoDColumn = indexedCol(
  'Y',
  indexedCol('X', 1, 2),
  indexedCol('X', 3, 4),
  indexedCol('X', 5, 6)
);

it('does nothing if wanted dimension is already dominant', async () => {
  expect(await testGetType(getType, twoDColumn, genericIdent('Y'))).toEqual(
    t.column(t.column(t.number(), 2, 'X'), 3, 'Y')
  );
});

it('can make a dimension dominant', async () => {
  expect(await testGetType(getType, twoDColumn, genericIdent('X'))).toEqual(
    t.column(t.column(t.number(), 3, 'Y'), 2, 'X')
  );
});

it('can get the value too', async () => {
  expect(
    (await testGetValue(getValue, twoDColumn, genericIdent('X'))).getData()
  ).toMatchInlineSnapshot(`
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

  expect(
    (await testGetValue(getValue, twoDColumn, genericIdent('Y'))).getData()
  ).toMatchInlineSnapshot(`
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
