import Fraction from '@decipad/fraction';
import { getAt, uniqDimensions } from './multidimensional-utils';
import { Column, FractionValue, fromJS, Value } from '../interpreter/Value';
import { Hypercube } from '../lazy';
import { objectToMap } from '../testUtils';
import { F, getInstanceof } from '../utils';
import { ConcreteValue } from '../lazy/ConcreteValue';

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
    expect(multiDimX.lowLevelGet(1).getData()).toEqual(F(2));
    expect(multidimDivision.lowLevelGet(0, 1).getData()).toEqual(F(50));

    expect(() => multidimDivision.lowLevelGet(0, 5).getData()).toThrow();
    expect(() => multidimDivision.lowLevelGet(5, 0).getData()).toThrow();
  });

  it('does not accept incomplete key sets', () => {
    expect(() => multiDimX.lowLevelGet()).toThrow();
    expect(() => multidimDivision.lowLevelGet()).toThrow();
  });

  it('can get a map of dimension names to keys', () => {
    expect(getAt(multiDimX, objectToMap({ X: 1 })).getData()).toEqual(F(2));
  });

  it('does not accept incomplete key maps', () => {
    expect(() => getAt(multiDimX, new Map())).toThrow();
  });

  it('can get from duplicate dimensions', () => {
    expect(getAt(multiDimXTwice, objectToMap({ X: 0 })).getData()).toEqual(
      F(1, 2)
    );
    expect(getAt(multiDimXTwice, objectToMap({ X: 2 })).getData()).toEqual(
      F(1, 2)
    );
  });

  it('accepts unnamed dimensions', () => {
    expect(getAt(anonDimHaver, new Map([[0, 1]])).getData()).toEqual(F(2));
    expect(
      getAt(
        twoAnonDims,
        new Map([
          [0, 1],
          [1, 1],
        ])
      ).getData()
    ).toEqual(F(102));
  });
});
