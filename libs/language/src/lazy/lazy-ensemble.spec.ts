import { N, ONE } from '@decipad/number';
import { all, map } from '@decipad/generator-utils';
import { PromiseOrType } from '@decipad/utils';
import {
  createColumnSlice,
  createConcatenatedColumn,
  createLazyOperation,
  createSwappedDimensions,
} from '.';
import { OneResult } from '../interpreter/interpreter-types';
import {
  Column,
  NumberValue,
  fromJS,
  getColumnLike,
  isColumnLike,
  Value,
} from '../value';
import { buildType as t } from '../type';
import { jsCol } from './testUtils';
import { OperationFunction } from './types';
import { createLazyAtIndex } from './LazyAtIndex';
import { materializeOneResult } from '../utils/materializeOneResult';

const addOne: OperationFunction = ([x]) =>
  fromJS((x as NumberValue).value.add(ONE));
const testLazyOp = async (...args: Parameters<typeof createLazyOperation>) =>
  createLazyOperation(...args);

const toAdd = jsCol([0, 1, 2]);

describe.each(
  Object.entries({
    Column: jsCol([1, 2, 3]),
    LazyAtIndex: createLazyAtIndex(
      jsCol([
        [0n, 0n, 0n],
        [1n, 2n, 3n],
      ]),
      1
    ),
    'SwappedDimensions (doing nothing because 1D)': createSwappedDimensions(
      jsCol([1, 2, 3]),
      0
    ),
    createLazyOperation: testLazyOp(addOne, [toAdd], [t.column(t.number())]),
    'createLazyOperation with named dims': testLazyOp(
      addOne,
      [toAdd],
      [t.column(t.number(), 'X')]
    ),
    ConcatenatedColumn: createConcatenatedColumn(jsCol([1]), jsCol([2, 3])),
    ColumnSlice: createColumnSlice(jsCol([0, 1, 2, 3, 4]), 1, 4),
  })
)('One dimensional tests: %s', (_name, lazyThing) => {
  it('can getData()', async () => {
    expect(
      await materializeOneResult((await lazyThing).getData())
    ).toMatchObject([N(1), N(2), N(3)]);
  });

  it('can get its contents with lowLevelGet and atIndex 1', async () => {
    expect(
      (
        await materializeOneResult(
          (await getColumnLike(await lazyThing).lowLevelGet(0)).getData()
        )
      )?.valueOf()
    ).toEqual(1);
  });
  it('can get its contents with lowLevelGet and atIndex 2', async () => {
    expect(
      (
        await materializeOneResult(
          (await getColumnLike(await lazyThing).lowLevelGet(2)).getData()
        )
      )?.valueOf()
    ).toEqual(3);
  });
  it('can get its contents with lowLevelGet and atIndex 3', async () => {
    expect(
      (
        await materializeOneResult(
          (await getColumnLike(await lazyThing).atIndex(0))?.getData()
        )
      )?.valueOf()
    ).toEqual(1);
  });
  it('can get its contents with lowLevelGet and atIndex 4', async () => {
    expect(
      (
        await materializeOneResult(
          (await getColumnLike(await lazyThing).atIndex(2))?.getData()
        )
      )?.valueOf()
    ).toEqual(3);
  });

  it('contains a .dimensions property', async () => {
    expect(await getColumnLike(await lazyThing).dimensions()).toEqual([
      { dimensionLength: 3 },
    ]);
  });

  it('contains .rowCount', async () => {
    expect(await getColumnLike(await lazyThing).rowCount()).toEqual(3);
  });

  it('contains .values', async () => {
    const numericValues = await all(
      map(getColumnLike(await lazyThing).values(), (value) =>
        (value as NumberValue).value.valueOf()
      )
    );
    expect(numericValues).toEqual([1, 2, 3]);
  });
});

type NumsArgValue = PromiseOrType<OneResult | Value | undefined>;

const nums = async (
  _values: NumsArgValue | Array<NumsArgValue>
): Promise<unknown> => {
  const values = await _values;
  if (values == null) {
    return [];
  }
  if (Array.isArray(values)) {
    return Promise.all(values.map(nums));
  } else if (values instanceof NumberValue || isColumnLike(values as Column)) {
    return nums(materializeOneResult(await (values as Value).getData()));
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
    LazyAtIndex: createLazyAtIndex(
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
    SwappedDimensions: createSwappedDimensions(
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
      [t.column(t.column(t.number()))]
    ),
    'createLazyOperation with named dims': testLazyOp(
      addOne,
      [toAdd2D],
      [t.column(t.column(t.number(), 'X'), 'Y')]
    ),
    'createLazyOperation with named dims (one unnamed)': testLazyOp(
      addOne,
      [toAdd2D],
      [t.column(t.column(t.number(), 'X'))]
    ),
    'createLazyOperation with named dims (other unnamed)': testLazyOp(
      addOne,
      [toAdd2D],
      [t.column(t.column(t.number()), 'X')]
    ),
  })
)('Two dimensional tests: %s', (_name, lazyThing) => {
  it('can getData()', async () => {
    expect(await materializeOneResult((await lazyThing).getData()))
      .toMatchInlineSnapshot(`
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

  it('can get its contents with lowLevelGet and atIndex', async () => {
    expect(
      await nums(await getColumnLike(await lazyThing).lowLevelGet(0, 0))
    ).toEqual(1);
    expect(
      await nums(await getColumnLike(await lazyThing).lowLevelGet(0, 2))
    ).toEqual(3);
    expect(
      await nums(await getColumnLike(await lazyThing).lowLevelGet(1, 0))
    ).toEqual(4);
    expect(
      await nums(await getColumnLike(await lazyThing).lowLevelGet(1, 2))
    ).toEqual(6);

    expect(await nums(await getColumnLike(await lazyThing).atIndex(0))).toEqual(
      [1, 2, 3]
    );
    expect(await nums(await getColumnLike(await lazyThing).atIndex(1))).toEqual(
      [4, 5, 6]
    );

    expect(
      await nums(
        await getColumnLike(
          await getColumnLike(await lazyThing).atIndex(0)
        ).atIndex(1)
      )
    ).toEqual(2);
    expect(
      await nums(
        await getColumnLike(
          await getColumnLike(await lazyThing).atIndex(1)
        ).atIndex(1)
      )
    ).toEqual(5);
  });

  it('contains a .dimensions property', async () => {
    expect(await getColumnLike(await lazyThing).dimensions()).toEqual([
      { dimensionLength: 2 },
      { dimensionLength: 3 },
    ]);
  });

  it('contains .rowCount', async () => {
    expect(await getColumnLike(await lazyThing).rowCount()).toEqual(2);
  });

  it('contains .values', async () => {
    const numericValues = await all(
      map(getColumnLike(await lazyThing).values(), async (v) =>
        nums(await materializeOneResult(v.getData()))
      )
    );
    expect(numericValues).toEqual([
      [1, 2, 3],
      [4, 5, 6],
    ]);
  });
});
