import Fraction from '@decipad/fraction';
import { Hypercube } from '.';
import { uniqDimensions } from '../dimtools/multidimensional-utils';
import { Column, FractionValue, fromJS, Value } from '../interpreter/Value';
import { build as t } from '../type';
import { F, getInstanceof } from '../utils';
import { ConcreteValue } from './ConcreteValue';
import { materializeToValue } from './materialize';

const jsCol = (
  items: (Fraction | bigint | (Fraction | bigint)[] | (Fraction | bigint)[][])[]
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
  ConcreteValue.fromColAndDim(jsCol([1n, 2n, 3n]), 'X')
);

const multiDimXTwice = new Hypercube(
  op((a, b) => a.div(b)),
  ConcreteValue.fromColAndDim(jsCol([1n, 2n, 3n]), 'X'),
  ConcreteValue.fromColAndDim(jsCol([2n, 4n, 6n]), 'X')
);

const multidimDivision = new Hypercube(
  op((a, b) => a.div(b)),
  ConcreteValue.fromColAndDim(jsCol([100n, 200n, 300n]), 'X'),
  ConcreteValue.fromColAndDim(jsCol([1n, 2n, 3n]), 'Y')
);

const anonDimHaver = new Hypercube(
  op((a) => a),
  ConcreteValue.fromColAndDim(jsCol([1n, 2n, 3n]), 0)
);

const twoAnonDims = new Hypercube(
  op((a, b) => a.add(b)),
  ConcreteValue.fromColAndDim(jsCol([1n, 2n, 3n]), 0),
  ConcreteValue.fromColAndDim(jsCol([10n, 100n, 1000n]), 1)
);

describe('materializing', () => {
  it('can return an interpreter Result with getData()', () => {
    expect(multiDimX.getData()).toEqual([F(1), F(2), F(3)]);
  });

  it('can return a 2D array', () => {
    expect(multidimDivision.getData()).toMatchInlineSnapshot(`
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
    expect(multiDimXTwice.getData()).toEqual([F(1, 2), F(1, 2), F(1, 2)]);
  });

  it('can materialize with anon indices', () => {
    expect(anonDimHaver.getData()).toEqual([F(1), F(2), F(3)]);
    expect(twoAnonDims.getData()).toEqual([
      [F(11), F(101), F(1001)],
      [F(12), F(102), F(1002)],
      [F(13), F(103), F(1003)],
    ]);
  });
});

describe('nesting', () => {
  it('can lowLevelGet into nested hypercubes', () => {
    const nested2 = new Hypercube(
      op((a) => a.add(100)),
      multiDimX
    );
    expect(nested2.lowLevelGet(0).getData()).toEqual(F(101));

    const nested3 = new Hypercube(
      op((a, b) => a.mul(100).add(b)),
      multiDimX,
      multiDimX
    );
    expect(nested3.lowLevelGet(0, 1).getData()).toEqual(F(102));
  });
});

describe('can be turned from, and into, Column values', () => {
  const fromCol = ConcreteValue.fromValue(
    jsCol([
      [1n, 2n, 3n],
      [4n, 5n, 6n],
    ]),
    t.column(t.column(t.number(), 3, 'X'), 2, 'Y')
  );

  it('can be created from a column', () => {
    expect(fromCol.getData()).toEqual([
      [F(1), F(2), F(3)],
      [F(4), F(5), F(6)],
    ]);

    expect(uniqDimensions(fromCol.dimensions)).toEqual([
      { dimensionId: 'Y', dimensionLength: 2 },
      { dimensionId: 'X', dimensionLength: 3 },
    ]);
  });

  it('can be turned back into a column', () => {
    expect(materializeToValue(fromCol)).toEqual(
      jsCol([
        [1n, 2n, 3n],
        [4n, 5n, 6n],
      ])
    );
  });

  it('can be created and re-columned if dim names are null', () => {
    const oneD = ConcreteValue.fromValue(
      jsCol([1n, 2n]),
      t.column(t.number(), 2, null)
    );
    const twoD = ConcreteValue.fromValue(
      jsCol([
        [1n, 2n],
        [2n, 3n],
      ]),
      t.column(t.column(t.number(), 1, null), 2, null)
    );
    expect(materializeToValue(oneD).getData()).toEqual([F(1), F(2)]);
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
      [F(1), F(2)],
      [F(2), F(3)],
    ]);
  });
});

it('Implements ColumnLike properly', () => {
  expect(multidimDivision.rowCount).toEqual(3);

  expect(multidimDivision.values.map((v) => v.getData()))
    .toMatchInlineSnapshot(`
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

  expect(multidimDivision.atIndex(2).getData()).toMatchInlineSnapshot(`
    Array [
      Fraction(300),
      Fraction(150),
      Fraction(100),
    ]
  `);
});
