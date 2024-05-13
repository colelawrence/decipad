import { makeContext } from '../Dimension/testUtils';
import { materializeOneResult } from '../utils/materializeOneResult';
import { getColumnLike } from './ColumnLike';
import { EmptyColumn } from './EmptyColumn';
import { fromJS } from './fromJS';
import { buildType } from '../Type';
import { createLazyOperation } from '../Dimension/LazyOperation';
import { getDimensionLength } from '../utils/getDimensionLength';

it('forbids access into it', async () => {
  await expect(async () =>
    new EmptyColumn([]).indexToLabelIndex()
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
      makeContext(),
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
      makeContext(),
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
      makeContext(),
      () => fromJS(1),
      [new EmptyColumn([])],
      [buildType.column(buildType.number())]
    )
  );
  expect(await materializeOneResult(await lazyOp.getData())).toEqual([]);

  const lazyOp2D = getColumnLike(
    await createLazyOperation(
      makeContext(),
      () => fromJS(1),
      [fromJS([1, 2]), fromJS([])],
      [
        buildType.column(buildType.number(), 'X'),
        buildType.column(buildType.number(), 'Y'),
      ]
    )
  );
  expect(
    await Promise.all(
      (
        await lazyOp2D.dimensions()
      ).map(async (d) => getDimensionLength(d.dimensionLength))
    )
  ).toMatchInlineSnapshot(`
    Array [
      2,
      0,
    ]
  `);
  expect(await materializeOneResult(await lazyOp2D.getData())).toEqual([]);
});
