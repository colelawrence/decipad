import { objectToMap } from '../testUtils';
import { getInstanceof } from '../utils';
import { build as t } from '../type';

import { Column, fromJS, Value, Scalar } from '../interpreter/Value';
import { Hypercube } from './hypercube';
import {
  DimensionalValue,
  getAt,
  hypercubeLikeToValue,
  uniqDimensions,
} from './multidimensional-utils';

const jsCol = (items: (number | number[] | number[][])[]) =>
  fromJS(items) as Column;

const op = (simpleCallback: (...args: number[]) => number) => (args: Value[]) =>
  fromJS(
    simpleCallback(
      ...args.map((a) => getInstanceof(a, Scalar).getData() as number)
    )
  );

const multiDimX = new Hypercube(
  op((a) => a),
  DimensionalValue.fromColAndDim(jsCol([1, 2, 3]), 'X')
);

const multiDimXTwice = new Hypercube(
  op((a, b) => a / b),
  DimensionalValue.fromColAndDim(jsCol([1, 2, 3]), 'X'),
  DimensionalValue.fromColAndDim(jsCol([2, 4, 6]), 'X')
);

const multidimDivision = new Hypercube(
  op((a, b) => a / b),
  DimensionalValue.fromColAndDim(jsCol([100, 200, 300]), 'X'),
  DimensionalValue.fromColAndDim(jsCol([1, 2, 3]), 'Y')
);

const anonDimHaver = new Hypercube(
  op((a) => a),
  DimensionalValue.fromColAndDim(jsCol([1, 2, 3]), 0)
);

const twoAnonDims = new Hypercube(
  op((a, b) => a + b),
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
    expect(multiDimX.lowLevelGet(1).getData()).toEqual(2);
    expect(multidimDivision.lowLevelGet(0, 1).getData()).toEqual(50);

    expect(() => multidimDivision.lowLevelGet(0, 5).getData()).toThrow();
    expect(() => multidimDivision.lowLevelGet(5, 0).getData()).toThrow();
  });

  it('does not accept incomplete key sets', () => {
    expect(() => multiDimX.lowLevelGet()).toThrow();
    expect(() => multidimDivision.lowLevelGet()).toThrow();
  });

  it('can get a map of dimension names to keys', () => {
    expect(getAt(multiDimX, objectToMap({ X: 1 })).getData()).toEqual(2);
  });

  it('does not accept incomplete key maps', () => {
    expect(() => getAt(multiDimX, new Map())).toThrow();
  });

  it('can get from duplicate dimensions', () => {
    expect(getAt(multiDimXTwice, objectToMap({ X: 0 })).getData()).toEqual(0.5);
    expect(getAt(multiDimXTwice, objectToMap({ X: 2 })).getData()).toEqual(0.5);
  });

  it('accepts unnamed dimensions', () => {
    expect(getAt(anonDimHaver, new Map([[0, 1]])).getData()).toEqual(2);
    expect(
      getAt(
        twoAnonDims,
        new Map([
          [0, 1],
          [1, 1],
        ])
      ).getData()
    ).toEqual(102);
  });
});

describe('materializing', () => {
  it('can return an interpreter Result with getData()', () => {
    expect(multiDimX.materialize()).toEqual([1, 2, 3]);
  });

  it('can return a 2D array', () => {
    expect(multidimDivision.materialize()).toMatchInlineSnapshot(`
      Array [
        Array [
          100,
          50,
          33.333333333333336,
        ],
        Array [
          200,
          100,
          66.66666666666667,
        ],
        Array [
          300,
          150,
          100,
        ],
      ]
    `);
  });

  it('can materialize if 2 dims are the same', () => {
    expect(multiDimXTwice.materialize()).toEqual([0.5, 0.5, 0.5]);
  });

  it('can materialize with anon indices', () => {
    expect(anonDimHaver.materialize()).toEqual([1, 2, 3]);
    expect(twoAnonDims.materialize()).toEqual([
      [11, 101, 1001],
      [12, 102, 1002],
      [13, 103, 1003],
    ]);
  });
});

describe('nesting', () => {
  it('can lowLevelGet into nested hypercubes', () => {
    const nested2 = new Hypercube(
      op((a) => a + 100),
      multiDimX
    );
    expect(nested2.lowLevelGet(0).getData()).toEqual(101);

    const nested3 = new Hypercube(
      op((a, b) => a * 100 + b),
      multiDimX,
      multiDimX
    );
    expect(nested3.lowLevelGet(0, 1).getData()).toEqual(102);
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
      [1, 2, 3],
      [4, 5, 6],
    ]);

    expect(uniqDimensions(fromCol.dimensions)).toEqual([
      { dimensionId: 'Y', dimensionLength: 2 },
      { dimensionId: 'X', dimensionLength: 3 },
    ]);
  });

  it('can be turned back into a column', () => {
    expect(hypercubeLikeToValue(fromCol)).toEqual(
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
    expect(hypercubeLikeToValue(oneD).getData()).toEqual([1, 2]);
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
    expect(hypercubeLikeToValue(twoD).getData()).toEqual([
      [1, 2],
      [2, 3],
    ]);
  });
});
