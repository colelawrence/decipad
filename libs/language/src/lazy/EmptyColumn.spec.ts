import { createLazyOperation } from '.';
import { fromJS, getColumnLike } from '../value';
import { buildType } from '../type';
import { EmptyColumn } from './EmptyColumn';

it('forbids access into it', () => {
  expect(() => new EmptyColumn([]).lowLevelGet()).toThrow();
  expect(() => new EmptyColumn([]).indexToLabelIndex()).toThrow();
  expect(() =>
    new EmptyColumn([{ dimensionLength: 1 }]).lowLevelGet()
  ).toThrow();
});

it('can be materialized', () => {
  expect(new EmptyColumn([]).getData()).toMatchInlineSnapshot(`Array []`);
});

it('can be materialized by a lazy operation', () => {
  const lazyOp = getColumnLike(
    createLazyOperation(
      () => new EmptyColumn([]),
      [fromJS([1, 2, 3])],
      [buildType.column(buildType.number(), 3)]
    )
  );
  expect(lazyOp.getData()).toEqual([[], [], []]);

  const lazyOpWithInnerDims = getColumnLike(
    createLazyOperation(
      () => new EmptyColumn([{ dimensionLength: 2 }]),
      [fromJS([1, 2, 3])],
      [buildType.column(buildType.number(), 3)]
    )
  );
  expect(lazyOpWithInnerDims.getData()).toEqual([[], [], []]);
});

it('can be the arg of a lazy operation', () => {
  const lazyOp = getColumnLike(
    createLazyOperation(
      () => fromJS(1),
      [new EmptyColumn([])],
      [buildType.column(buildType.number(), 'unknown')]
    )
  );
  expect(lazyOp.getData()).toEqual([]);

  const lazyOp2D = getColumnLike(
    createLazyOperation(
      () => fromJS(1),
      [fromJS([1, 2]), fromJS([])],
      [
        buildType.column(buildType.number(), 'unknown', 'X'),
        buildType.column(buildType.number(), 'unknown', 'Y'),
      ]
    )
  );
  expect(lazyOp2D.dimensions).toMatchInlineSnapshot(`
    Array [
      Object {
        "dimensionLength": 2,
      },
      Object {
        "dimensionLength": 0,
      },
    ]
  `);
  expect(lazyOp2D.getData()).toEqual([]);
});
