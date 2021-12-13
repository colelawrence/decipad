import Fraction from '@decipad/fraction';
import { Value } from '../interpreter';
import { FractionValue, fromJS, Column } from '../interpreter/Value';
import { getInstanceof } from '../utils';
import { Hypercube } from './hypercube';
import { DimensionalValue } from './multidimensional-utils';
import { SwappedHypercube } from './SwappedHypercube';
import { materialize } from './materialize';

const op =
  (simpleCallback: (...args: Fraction[]) => Fraction) => (args: Value[]) =>
    fromJS(
      simpleCallback(
        ...args.map((a) => getInstanceof(a, FractionValue).getData())
      )
    );

const jsCol = (items: number[]) => fromJS(items) as Column;

const multiDimX = new Hypercube(
  op((a) => a),
  DimensionalValue.fromColAndDim(jsCol([1, 2, 3]), 'X')
);

const twoAnonDims = new Hypercube(
  op((a, b) => a.add(b)),
  DimensionalValue.fromColAndDim(jsCol([1, 2]), 0),
  DimensionalValue.fromColAndDim(jsCol([10, 100]), 1)
);

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
  expect(materialize(new SwappedHypercube(multiDimX, 'X')))
    .toMatchInlineSnapshot(`
      Array [
        Fraction(1),
        Fraction(2),
        Fraction(3),
      ]
    `);
});

const multiDimXTwice = new Hypercube(
  op((a, b) => a.div(b)),
  DimensionalValue.fromColAndDim(jsCol([1, 2]), 'X'),
  DimensionalValue.fromColAndDim(jsCol([2, 4]), 'X')
);

const multiDimXTwiceWithOneBefore = new Hypercube(
  op((a, b) => a.div(b)),
  multiDimXTwice,
  DimensionalValue.fromColAndDim(jsCol([2, 4]), 'Y')
);

describe('with dupe dimensions', () => {
  it('can keep 2 of the same dimensions on top', () => {
    expect(materialize(new SwappedHypercube(multiDimXTwiceWithOneBefore, 'X')))
      .toMatchInlineSnapshot(`
        Array [
          Array [
            Fraction(0.25),
            Fraction(0.125),
          ],
          Array [
            Fraction(0.25),
            Fraction(0.125),
          ],
        ]
      `);
  });

  it('can pull another dimension from under 2 of the same', () => {
    expect(materialize(new SwappedHypercube(multiDimXTwiceWithOneBefore, 'Y')))
      .toMatchInlineSnapshot(`
        Array [
          Array [
            Fraction(0.25),
            Fraction(0.25),
          ],
          Array [
            Fraction(0.125),
            Fraction(0.125),
          ],
        ]
      `);
  });
});
