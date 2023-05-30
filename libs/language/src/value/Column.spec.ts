import { Column, fromJS, slice, sort, unique } from '.';
import { materializeOneResult } from '../utils/materializeOneResult';

describe('column value', () => {
  it('can be constructed from values', async () => {
    const column = Column.fromValues([1, 2, 3].map((n) => fromJS(n)));
    expect(await materializeOneResult(await column.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber(1),
        DeciNumber(2),
        DeciNumber(3),
      ]
    `);
  });

  it('can be constructed from other columns', async () => {
    const column1 = Column.fromValues([1, 2, 3].map((n) => fromJS(n)));
    const column2 = Column.fromValues([4, 5, 6].map((n) => fromJS(n)));
    const column = Column.fromValues([column1, column2]);
    expect(await materializeOneResult(await column.getData()))
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

  it('can be sorted', async () => {
    const originalColumn = Column.fromValues([3, 1, 2].map((n) => fromJS(n)));
    const sortedColumn = await sort(originalColumn);
    expect(await materializeOneResult(await originalColumn.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber(3),
        DeciNumber(1),
        DeciNumber(2),
      ]
    `);
    expect(await materializeOneResult(await sortedColumn.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber(1),
        DeciNumber(2),
        DeciNumber(3),
      ]
    `);
  });

  it('can derive a column with unique values', async () => {
    const originalColumn = fromJS([3, 1, 2, 3, 3, 5, 1, 2, 3, 0]) as Column;
    const uniqueValuesColumn = await unique(originalColumn);
    expect(await materializeOneResult(await originalColumn.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber(3),
        DeciNumber(1),
        DeciNumber(2),
        DeciNumber(3),
        DeciNumber(3),
        DeciNumber(5),
        DeciNumber(1),
        DeciNumber(2),
        DeciNumber(3),
        DeciNumber(0),
      ]
    `);

    expect(await materializeOneResult(await uniqueValuesColumn.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber(0),
        DeciNumber(1),
        DeciNumber(2),
        DeciNumber(3),
        DeciNumber(5),
      ]
    `);
  });

  it('a column can be sliced', async () => {
    const originalColumn = fromJS([1, 2, 3, 4, 5, 6, 7, 8, 9]) as Column;
    const slice1 = await slice(originalColumn, 3, 7);
    const slice2 = await slice(originalColumn, 7, 9);
    expect(await materializeOneResult(await originalColumn.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber(1),
        DeciNumber(2),
        DeciNumber(3),
        DeciNumber(4),
        DeciNumber(5),
        DeciNumber(6),
        DeciNumber(7),
        DeciNumber(8),
        DeciNumber(9),
      ]
    `);
    expect(await materializeOneResult(await slice1.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber(4),
        DeciNumber(5),
        DeciNumber(6),
        DeciNumber(7),
      ]
    `);
    expect(await materializeOneResult(await slice2.getData()))
      .toMatchInlineSnapshot(`
      Array [
        DeciNumber(8),
        DeciNumber(9),
      ]
    `);
  });
});
