import { N } from '@decipad/number';
import { sort, unique, slice } from '@decipad/column';
import { all } from '@decipad/generator-utils';
import { Column } from './Column';
import { compare } from '../compare';

const toN = (n: number) => N(n);

describe('column value', () => {
  it('can be constructed from values', async () => {
    const column = Column.fromValues([1, 2, 3].map(toN));
    expect(await column.rowCount()).toBe(3);
    expect(await all(column.values())).toMatchInlineSnapshot(`
      Array [
        DeciNumber(1),
        DeciNumber(2),
        DeciNumber(3),
      ]
    `);
  });

  it('can be sorted', async () => {
    const originalColumn = Column.fromValues([3, 1, 2].map(toN));
    const sortedColumn = await sort(originalColumn, compare);
    expect(await all(originalColumn.values())).toMatchInlineSnapshot(`
      Array [
        DeciNumber(3),
        DeciNumber(1),
        DeciNumber(2),
      ]
    `);
    expect(await all(sortedColumn.values())).toMatchInlineSnapshot(`
      Array [
        DeciNumber(1),
        DeciNumber(2),
        DeciNumber(3),
      ]
    `);
  });

  it('can derive a column with unique values', async () => {
    const originalColumn = Column.fromValues(
      [3, 1, 2, 3, 3, 5, 1, 2, 3, 0].map(toN)
    ) as Column;
    const uniqueValuesColumn = await unique(originalColumn, compare);
    expect(await all(originalColumn.values())).toMatchInlineSnapshot(`
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

    expect(await all(uniqueValuesColumn.values())).toMatchInlineSnapshot(`
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
    const originalColumn = Column.fromValues(
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map(toN)
    );
    const slice1 = slice(originalColumn, 3, 7);
    const slice2 = slice(originalColumn, 7, 9);
    expect(await all(originalColumn.values())).toMatchInlineSnapshot(`
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
    expect(await all(slice1.values())).toMatchInlineSnapshot(`
      Array [
        DeciNumber(4),
        DeciNumber(5),
        DeciNumber(6),
        DeciNumber(7),
      ]
    `);
    expect(await all(slice2.values())).toMatchInlineSnapshot(`
      Array [
        DeciNumber(8),
        DeciNumber(9),
      ]
    `);
  });
});
