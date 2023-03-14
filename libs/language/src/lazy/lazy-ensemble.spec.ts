import { ONE } from '@decipad/number';
import { ConcatenatedColumn, createLazyOperation } from '.';
import { OneResult } from '../interpreter/interpreter-types';
import {
  Column,
  ColumnLike,
  NumberValue,
  fromJS,
  getColumnLike,
  isColumnLike,
  Value,
} from '../value';
import { buildType as t } from '../type';
import { ColumnSlice } from './ColumnSlice';
import { LazyAtIndex } from './LazyAtIndex';
import { SwappedDimensions } from './SwappedDimensions';
import { jsCol } from './testUtils';
import { OperationFunction } from './types';

const addOne: OperationFunction = ([x]) =>
  fromJS((x as NumberValue).value.add(ONE));
const testLazyOp = (...args: Parameters<typeof createLazyOperation>) =>
  getColumnLike(createLazyOperation(...args));

const toAdd = jsCol([0, 1, 2]);

describe.each(
  Object.entries({
    Column: jsCol([1, 2, 3]),
    LazyAtIndex: new LazyAtIndex(
      jsCol([
        [0n, 0n, 0n],
        [1n, 2n, 3n],
      ]),
      1
    ),
    'SwappedDimensions (doing nothing because 1D)': new SwappedDimensions(
      jsCol([1, 2, 3]),
      0
    ),
    createLazyOperation: testLazyOp(addOne, [toAdd], [t.column(t.number(), 3)]),
    'createLazyOperation with named dims': testLazyOp(
      addOne,
      [toAdd],
      [t.column(t.number(), 3, 'X')]
    ),
    ConcatenatedColumn: new ConcatenatedColumn(jsCol([1]), jsCol([2, 3])),
    ColumnSlice: new ColumnSlice(jsCol([0, 1, 2, 3, 4]), 1, 4),
  })
)('One dimensional tests: %s', (_name, lazyThing: ColumnLike) => {
  it('can getData()', () => {
    expect(lazyThing.getData()).toMatchInlineSnapshot(`
      Array [
        DeciNumber(1),
        DeciNumber(2),
        DeciNumber(3),
      ]
    `);
  });

  it('can get its contents with lowLevelGet and atIndex', () => {
    expect(lazyThing.lowLevelGet(0).getData().valueOf()).toEqual(1);
    expect(lazyThing.lowLevelGet(2).getData().valueOf()).toEqual(3);

    expect(lazyThing.atIndex(0).getData().valueOf()).toEqual(1);
    expect(lazyThing.atIndex(2).getData().valueOf()).toEqual(3);
  });

  it('bound checks', () => {
    expect(() => lazyThing.lowLevelGet(-1)).toThrow();
    expect(() => lazyThing.lowLevelGet(4)).toThrow();

    expect(() => lazyThing.atIndex(-1)).toThrow();
    expect(() => lazyThing.atIndex(4)).toThrow();
  });

  it('validates keys in lowLevelGet', () => {
    // Too few coordinates
    expect(() => lazyThing.lowLevelGet()).toThrow();

    // Too many coordinates
    expect(() => lazyThing.lowLevelGet(0, 0)).toThrow();
  });

  it('contains a .dimensions property', () => {
    expect(lazyThing.dimensions).toEqual([{ dimensionLength: 3 }]);
  });

  it('contains .rowCount', () => {
    expect(lazyThing.rowCount).toEqual(3);
  });

  it('contains .values', () => {
    const numericValues = lazyThing.values.map((value) =>
      (value as NumberValue).value.valueOf()
    );
    expect(numericValues).toEqual([1, 2, 3]);
  });
});

const nums = (values: OneResult | Value): unknown => {
  if (Array.isArray(values)) {
    return values.map(nums);
  } else if (values instanceof NumberValue || isColumnLike(values as Column)) {
    return nums((values as Value).getData());
  } else {
    return values.valueOf();
  }
};

const toAdd2D = jsCol([
  [0n, 1n, 2n],
  [3n, 4n, 5n],
]);

describe.each(
  Object.entries({
    Column: jsCol([
      [1n, 2n, 3n],
      [4n, 5n, 6n],
    ]),
    LazyAtIndex: new LazyAtIndex(
      jsCol([
        [
          [0n, 0n, 0n],
          [0n, 0n, 0n],
        ],
        [
          [1n, 2n, 3n],
          [4n, 5n, 6n],
        ],
      ]),
      1
    ),
    SwappedDimensions: new SwappedDimensions(
      jsCol([
        [1n, 4n],
        [2n, 5n],
        [3n, 6n],
      ]),
      1
    ),
    createLazyOperation: testLazyOp(
      addOne,
      [toAdd2D],
      [t.column(t.column(t.number(), 3), 2)]
    ),
    'createLazyOperation with named dims': testLazyOp(
      addOne,
      [toAdd2D],
      [t.column(t.column(t.number(), 3, 'X'), 2, 'Y')]
    ),
    'createLazyOperation with named dims (one unnamed)': testLazyOp(
      addOne,
      [toAdd2D],
      [t.column(t.column(t.number(), 3, 'X'), 2)]
    ),
    'createLazyOperation with named dims (other unnamed)': testLazyOp(
      addOne,
      [toAdd2D],
      [t.column(t.column(t.number(), 3), 2, 'X')]
    ),
  })
)('Two dimensional tests: %s', (_name, lazyThing: ColumnLike) => {
  it('can getData()', () => {
    expect(lazyThing.getData()).toMatchInlineSnapshot(`
      Array [
        Array [
          DeciNumber(1),
          DeciNumber(2),
          DeciNumber(3),
        ],
        Array [
          DeciNumber(4),
          DeciNumber(5),
          DeciNumber(6),
        ],
      ]
    `);
  });

  it('can get its contents with lowLevelGet and atIndex', () => {
    expect(nums(lazyThing.lowLevelGet(0, 0))).toEqual(1);
    expect(nums(lazyThing.lowLevelGet(0, 2))).toEqual(3);
    expect(nums(lazyThing.lowLevelGet(1, 0))).toEqual(4);
    expect(nums(lazyThing.lowLevelGet(1, 2))).toEqual(6);

    expect(nums(lazyThing.atIndex(0))).toEqual([1, 2, 3]);
    expect(nums(lazyThing.atIndex(1))).toEqual([4, 5, 6]);

    expect(nums(getColumnLike(lazyThing.atIndex(0)).atIndex(1))).toEqual(2);
    expect(nums(getColumnLike(lazyThing.atIndex(1)).atIndex(1))).toEqual(5);
  });

  it('bound-checks', () => {
    expect(() => lazyThing.lowLevelGet(-1)).toThrow();
    expect(() => lazyThing.lowLevelGet(4)).toThrow();
    expect(() => lazyThing.lowLevelGet(0, -1)).toThrow();
    expect(() => lazyThing.lowLevelGet(4, 0)).toThrow();
    expect(() => lazyThing.atIndex(-1)).toThrow();
    expect(() => lazyThing.atIndex(4)).toThrow();
  });

  it('validates keys in lowLevelGet', () => {
    expect(() => lazyThing.lowLevelGet()).toThrow();
    expect(() => lazyThing.lowLevelGet(1)).toThrow();
    expect(() => lazyThing.lowLevelGet(1, 2, 3)).toThrow();
  });

  it('contains a .dimensions property', () => {
    expect(lazyThing.dimensions).toEqual([
      { dimensionLength: 2 },
      { dimensionLength: 3 },
    ]);
  });

  it('contains .rowCount', () => {
    expect(lazyThing.rowCount).toEqual(2);
  });

  it('contains .values', () => {
    const numericValues = lazyThing.values.map((v) => nums(v.getData()));
    expect(numericValues).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });
});
