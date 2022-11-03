import Fraction from '@decipad/fraction';
import { Hypercube, uniqDimensions } from './Hypercube';
import { FractionValue, fromJS, Value } from '../value';
import { F, getInstanceof } from '../utils';

import { hcArg } from './testUtils';

const op =
  (simpleCallback: (...args: Fraction[]) => Fraction) => (args: Value[]) =>
    fromJS(
      simpleCallback(
        ...args.map((a) => getInstanceof(a, FractionValue).getData())
      )
    );

const multiDimX = new Hypercube(
  op((a) => a),
  hcArg([1n, 2n, 3n], 'X')
);

const multiDimXTwice = new Hypercube(
  op((a, b) => a.div(b)),
  hcArg([1n, 2n, 3n], 'X'),
  hcArg([2n, 4n, 6n], 'X')
);

const multidimDivision = new Hypercube(
  op((a, b) => a.div(b)),
  hcArg([100n, 200n, 300n], 'X'),
  hcArg([1n, 2n, 3n], 'Y')
);

describe('nesting', () => {
  it('can lowLevelGet into nested hypercubes', () => {
    const nested2 = new Hypercube(
      op((a) => a.add(100)),
      [multiDimX, ['X']]
    );
    expect(nested2.lowLevelGet(0).getData()).toEqual(F(101));

    const nested3 = new Hypercube(
      op((a, b) => a.mul(100).add(b)),
      [multiDimX, ['X']],
      [multiDimX, ['X']]
    );
    expect(nested3.lowLevelGet(0).getData()).toEqual(F(101));
    expect(nested3.getData()).toMatchInlineSnapshot(`
      Array [
        Fraction(101),
        Fraction(202),
        Fraction(303),
      ]
    `);
  });
});

it('uniqDimensions can find out what dimensions are involved and give them to ya', () => {
  expect(uniqDimensions(multiDimX.args)).toEqual([
    ['X'],
    [{ dimensionLength: 3 }],
  ]);
  expect(uniqDimensions(multiDimXTwice.args)).toEqual([
    ['X'],
    [{ dimensionLength: 3 }],
  ]);
  expect(uniqDimensions(multidimDivision.args)).toEqual([
    ['X', 'Y'],
    [{ dimensionLength: 3 }, { dimensionLength: 3 }],
  ]);
});

it('can operate with one column', () => {
  const operateWithOneD = new Hypercube(
    op((a, b) => a.add(b)),
    hcArg([1n, 2n, 3n], 'X'),
    hcArg(100n, 0)
  );

  expect(operateWithOneD.getData()).toMatchInlineSnapshot(`
    Array [
      Fraction(101),
      Fraction(102),
      Fraction(103),
    ]
  `);

  const operateWithOneDReversed = new Hypercube(
    op((a, b) => a.add(b)),
    hcArg(100n, 0),
    hcArg([1n, 2n, 3n], 'X')
  );

  expect(operateWithOneDReversed.getData()).toMatchInlineSnapshot(`
    Array [
      Fraction(101),
      Fraction(102),
      Fraction(103),
    ]
  `);
});
