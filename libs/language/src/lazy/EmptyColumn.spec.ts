import { createLazyOperation } from '.';
import { fromJS, getColumnLike } from '../value';
import { buildType } from '../type';
import { EmptyColumn } from './EmptyColumn';
import { materializeOneResult } from '../utils/materializeOneResult';

it('forbids access into it', async () => {
  await expect(async () => new EmptyColumn([]).lowLevelGet()).rejects.toThrow();
  await expect(async () =>
    new EmptyColumn([]).indexToLabelIndex()
  ).rejects.toThrow();
  await expect(async () =>
    new EmptyColumn([{ dimensionLength: 1 }]).lowLevelGet()
  ).rejects.toThrow();
});

it('can be materialized', async () => {
  expect(
    await materializeOneResult(await new EmptyColumn([]).getData())
  ).toMatchInlineSnapshot(`Array []`);
});

it('can be materialized by a lazy operation', async () => {
  const lazyOp = getColumnLike(
    await createLazyOperation(
      () => new EmptyColumn([]),
      [fromJS([1, 2, 3])],
      [buildType.column(buildType.number())]
    )
  );
  expect(await materializeOneResult(await lazyOp.getData())).toEqual([
    [],
    [],
    [],
  ]);

  const lazyOpWithInnerDims = getColumnLike(
    await createLazyOperation(
      () => new EmptyColumn([{ dimensionLength: 2 }]),
      [fromJS([1, 2, 3])],
      [buildType.column(buildType.number())]
    )
  );
  expect(
    await materializeOneResult(await lazyOpWithInnerDims.getData())
  ).toEqual([[], [], []]);
});

it('can be the arg of a lazy operation', async () => {
  const lazyOp = getColumnLike(
    await createLazyOperation(
      () => fromJS(1),
      [new EmptyColumn([])],
      [buildType.column(buildType.number())]
    )
  );
  expect(await materializeOneResult(await lazyOp.getData())).toEqual([]);

  const lazyOp2D = getColumnLike(
    await createLazyOperation(
      () => fromJS(1),
      [fromJS([1, 2]), fromJS([])],
      [
        buildType.column(buildType.number(), 'X'),
        buildType.column(buildType.number(), 'Y'),
      ]
    )
  );
  expect(await lazyOp2D.dimensions()).toMatchInlineSnapshot(`
    Array [
      Object {
        "dimensionLength": 2,
      },
      Object {
        "dimensionLength": 0,
      },
    ]
  `);
  expect(await materializeOneResult(await lazyOp2D.getData())).toEqual([]);
});
