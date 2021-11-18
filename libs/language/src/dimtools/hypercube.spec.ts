import Fraction from 'fraction.js';
import { objectToMap } from '../testUtils';
import { getInstanceof } from '../utils';
import { build as t } from '../type';

import { Column, FractionValue, fromJS, Value } from '../interpreter/Value';
import { Hypercube } from './hypercube';
import {
  DimensionalValue,
  getAt,
  uniqDimensions,
} from './multidimensional-utils';
import { materializeToValue } from './materialize';

const jsCol = (
  items: (Fraction | number | (Fraction | number)[] | (Fraction | number)[][])[]
) => fromJS(items) as Column;

const op =
  (simpleCallback: (...args: Fraction[]) => Fraction) => (args: Value[]) =>
    fromJS(
      simpleCallback(
        ...args.map((a) => getInstanceof(a, FractionValue).getData())
      )
    );

const multiDimX = new Hypercube(
  op((a) => a),
  DimensionalValue.fromColAndDim(jsCol([1, 2, 3]), 'X')
);

const multiDimXTwice = new Hypercube(
  op((a, b) => a.div(b)),
  DimensionalValue.fromColAndDim(jsCol([1, 2, 3]), 'X'),
  DimensionalValue.fromColAndDim(jsCol([2, 4, 6]), 'X')
);

const multidimDivision = new Hypercube(
  op((a, b) => a.div(b)),
  DimensionalValue.fromColAndDim(jsCol([100, 200, 300]), 'X'),
  DimensionalValue.fromColAndDim(jsCol([1, 2, 3]), 'Y')
);

const anonDimHaver = new Hypercube(
  op((a) => a),
  DimensionalValue.fromColAndDim(jsCol([1, 2, 3]), 0)
);

const twoAnonDims = new Hypercube(
  op((a, b) => a.add(b)),
  DimensionalValue.fromColAndDim(jsCol([1, 2, 3]), 0),
  DimensionalValue.fromColAndDim(jsCol([10, 100, 1000]), 1)
);

it('uniqDimensions can find out what dimensions are involved and give them to ya', () => {
  expect(uniqDimensions(multiDimX.dimensions)).toEqual([
    { dimensionLength: 3, dimensionId: 'X' },
  ]);
  expect(uniqDimensions(multidimDivision.dimensions)).toEqual([
    { dimensionLength: 3, dimensionId: 'X' },
    { dimensionLength: 3, dimensionId: 'Y' },
  ]);
});

describe('getAt', () => {
  it('can get a deep key from the MD', () => {
    expect(multiDimX.lowLevelGet(1).getData()).toEqual({ d: 1, n: 2, s: 1 });
    expect(multidimDivision.lowLevelGet(0, 1).getData()).toEqual({
      d: 1,
      n: 50,
      s: 1,
    });

    expect(() => multidimDivision.lowLevelGet(0, 5).getData()).toThrow();
    expect(() => multidimDivision.lowLevelGet(5, 0).getData()).toThrow();
  });

  it('does not accept incomplete key sets', () => {
    expect(() => multiDimX.lowLevelGet()).toThrow();
    expect(() => multidimDivision.lowLevelGet()).toThrow();
  });

  it('can get a map of dimension names to keys', () => {
    expect(getAt(multiDimX, objectToMap({ X: 1 })).getData()).toEqual({
      d: 1,
      n: 2,
      s: 1,
    });
  });

  it('does not accept incomplete key maps', () => {
    expect(() => getAt(multiDimX, new Map())).toThrow();
  });

  it('can get from duplicate dimensions', () => {
    expect(getAt(multiDimXTwice, objectToMap({ X: 0 })).getData()).toEqual({
      d: 2,
      n: 1,
      s: 1,
    });
    expect(getAt(multiDimXTwice, objectToMap({ X: 2 })).getData()).toEqual({
      d: 2,
      n: 1,
      s: 1,
    });
  });

  it('accepts unnamed dimensions', () => {
    expect(getAt(anonDimHaver, new Map([[0, 1]])).getData()).toEqual({
      d: 1,
      n: 2,
      s: 1,
    });
    expect(
      getAt(
        twoAnonDims,
        new Map([
          [0, 1],
          [1, 1],
        ])
      ).getData()
    ).toEqual({ d: 1, n: 102, s: 1 });
  });
});

describe('materializing', () => {
  it('can return an interpreter Result with getData()', () => {
    expect(multiDimX.materialize()).toEqual([
      { d: 1, n: 1, s: 1 },
      { d: 1, n: 2, s: 1 },
      { d: 1, n: 3, s: 1 },
    ]);
  });

  it('can return a 2D array', () => {
    expect(multidimDivision.materialize()).toMatchInlineSnapshot(`
Array [
  Array [
    Fraction(100),
    Fraction(50),
    Fraction(33.(3)),
  ],
  Array [
    Fraction(200),
    Fraction(100),
    Fraction(66.(6)),
  ],
  Array [
    Fraction(300),
    Fraction(150),
    Fraction(100),
  ],
]
`);
  });

  it('can materialize if 2 dims are the same', () => {
    expect(multiDimXTwice.materialize()).toEqual([
      { d: 2, n: 1, s: 1 },
      { d: 2, n: 1, s: 1 },
      { d: 2, n: 1, s: 1 },
    ]);
  });

  it('can materialize with anon indices', () => {
    expect(anonDimHaver.materialize()).toEqual([
      { s: 1, n: 1, d: 1 },
      { s: 1, n: 2, d: 1 },
      { s: 1, n: 3, d: 1 },
    ]);
    expect(twoAnonDims.materialize()).toEqual([
      [
        { s: 1, n: 11, d: 1 },
        { s: 1, n: 101, d: 1 },
        { s: 1, n: 1001, d: 1 },
      ],
      [
        { s: 1, n: 12, d: 1 },
        { s: 1, n: 102, d: 1 },
        { s: 1, n: 1002, d: 1 },
      ],
      [
        { s: 1, n: 13, d: 1 },
        { s: 1, n: 103, d: 1 },
        { s: 1, n: 1003, d: 1 },
      ],
    ]);
  });
});

describe('nesting', () => {
  it('can lowLevelGet into nested hypercubes', () => {
    const nested2 = new Hypercube(
      op((a) => a.add(100)),
      multiDimX
    );
    expect(nested2.lowLevelGet(0).getData()).toEqual({ s: 1, n: 101, d: 1 });

    const nested3 = new Hypercube(
      op((a, b) => a.mul(100).add(b)),
      multiDimX,
      multiDimX
    );
    expect(nested3.lowLevelGet(0, 1).getData()).toEqual({ s: 1, n: 102, d: 1 });
  });
});

describe('can be turned from, and into, Column values', () => {
  const fromCol = DimensionalValue.fromValue(
    jsCol([
      [1, 2, 3],
      [4, 5, 6],
    ]),
    t.column(t.column(t.number(), 3, 'X'), 2, 'Y')
  );

  it('can be created from a column', () => {
    expect(fromCol.materialize()).toEqual([
      [
        { s: 1, n: 1, d: 1 },
        { s: 1, n: 2, d: 1 },
        { s: 1, n: 3, d: 1 },
      ],
      [
        { s: 1, n: 4, d: 1 },
        { s: 1, n: 5, d: 1 },
        { s: 1, n: 6, d: 1 },
      ],
    ]);

    expect(uniqDimensions(fromCol.dimensions)).toEqual([
      { dimensionId: 'Y', dimensionLength: 2 },
      { dimensionId: 'X', dimensionLength: 3 },
    ]);
  });

  it('can be turned back into a column', () => {
    expect(materializeToValue(fromCol)).toEqual(
      jsCol([
        [1, 2, 3],
        [4, 5, 6],
      ])
    );
  });

  it('can be created and re-columned if dim names are null', () => {
    const oneD = DimensionalValue.fromValue(
      jsCol([1, 2]),
      t.column(t.number(), 2, null)
    );
    const twoD = DimensionalValue.fromValue(
      jsCol([
        [1, 2],
        [2, 3],
      ]),
      t.column(t.column(t.number(), 1, null), 2, null)
    );
    expect(materializeToValue(oneD).getData()).toEqual([
      { s: 1, n: 1, d: 1 },
      { s: 1, n: 2, d: 1 },
    ]);
    expect(oneD.dimensions).toEqual([
      {
        dimensionLength: 2,
        dimensionId: 0,
      },
    ]);

    expect(twoD.dimensions).toEqual([
      {
        dimensionLength: 2,
        dimensionId: 0,
      },
      {
        dimensionLength: 2,
        dimensionId: 1,
      },
    ]);
    expect(materializeToValue(twoD).getData()).toEqual([
      [
        { s: 1, n: 1, d: 1 },
        { s: 1, n: 2, d: 1 },
      ],
      [
        { s: 1, n: 2, d: 1 },
        { s: 1, n: 3, d: 1 },
      ],
    ]);
  });
});
