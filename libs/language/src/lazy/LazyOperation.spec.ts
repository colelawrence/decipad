import DeciNumber, { N } from '@decipad/number';
import { LazyOperation, uniqDimensions } from './LazyOperation';
import { NumberValue, fromJS, Value } from '../value';
import { getInstanceof } from '../utils';

import { hcArg } from './testUtils';

const op =
  (simpleCallback: (...args: DeciNumber[]) => DeciNumber) => (args: Value[]) =>
    fromJS(
      simpleCallback(
        ...args.map((a) => getInstanceof(a, NumberValue).getData())
      )
    );

const multiDimX = new LazyOperation(
  op((a) => a),
  hcArg([1n, 2n, 3n], 'X')
);

const multiDimXTwice = new LazyOperation(
  op((a, b) => a.div(b)),
  hcArg([1n, 2n, 3n], 'X'),
  hcArg([2n, 4n, 6n], 'X')
);

const multidimDivision = new LazyOperation(
  op((a, b) => a.div(b)),
  hcArg([100n, 200n, 300n], 'X'),
  hcArg([1n, 2n, 3n], 'Y')
);

describe('nesting', () => {
  it('can lowLevelGet into nested hypercubes', () => {
    const nested2 = new LazyOperation(
      op((a) => a.add(N(100))),
      [multiDimX, ['X']]
    );
    expect(nested2.lowLevelGet(0).getData()).toEqual(N(101));

    const nested3 = new LazyOperation(
      op((a, b) => a.mul(N(100)).add(b)),
      [multiDimX, ['X']],
      [multiDimX, ['X']]
    );
    expect(nested3.lowLevelGet(0).getData()).toEqual(N(101));
    expect(nested3.getData()).toMatchInlineSnapshot(`
      Array [
        DeciNumber(101),
        DeciNumber(202),
        DeciNumber(303),
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
  const operateWithOneD = new LazyOperation(
    op((a, b) => a.add(b)),
    hcArg([1n, 2n, 3n], 'X'),
    hcArg(100n, 0)
  );

  expect(operateWithOneD.getData()).toMatchInlineSnapshot(`
    Array [
      DeciNumber(101),
      DeciNumber(102),
      DeciNumber(103),
    ]
  `);

  const operateWithOneDReversed = new LazyOperation(
    op((a, b) => a.add(b)),
    hcArg(100n, 0),
    hcArg([1n, 2n, 3n], 'X')
  );

  expect(operateWithOneDReversed.getData()).toMatchInlineSnapshot(`
    Array [
      DeciNumber(101),
      DeciNumber(102),
      DeciNumber(103),
    ]
  `);
});
