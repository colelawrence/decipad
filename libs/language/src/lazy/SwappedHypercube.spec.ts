import { materialize } from './materialize';
import { SwappedHypercube } from './SwappedHypercube';
import { jsCol } from './testUtils';

const multiDimX = jsCol([1n, 2n, 3n]);

const twoAnonDims = jsCol([
  [11n, 101n],
  [12n, 102n],
]);

it('can swap dimensions of a hypercube', () => {
  expect(materialize(new SwappedHypercube(twoAnonDims, 1)))
    .toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(11),
          Fraction(12),
        ],
        Array [
          Fraction(101),
          Fraction(102),
        ],
      ]
    `);
});

it('or left alone', () => {
  expect(materialize(new SwappedHypercube(twoAnonDims, 0)))
    .toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(11),
          Fraction(101),
        ],
        Array [
          Fraction(12),
          Fraction(102),
        ],
      ]
    `);
});

it('can swap nothing if the dimension is 1D', () => {
  expect(materialize(new SwappedHypercube(multiDimX, 0)))
    .toMatchInlineSnapshot(`
      Array [
        Fraction(1),
        Fraction(2),
        Fraction(3),
      ]
    `);
});
