import { N } from '@decipad/number';
import { sort, unique, slice } from '@decipad/column';
import { Column } from './Column';
import { compare } from '../compare';

const toN = (n: number) => N(n);

describe('column value', () => {
  it('can be constructed from values', () => {
    const column = Column.fromValues([1, 2, 3].map(toN));
    expect(column.rowCount).toBe(3);
    expect(column.values).toMatchInlineSnapshot(`
      Array [
        DeciNumber(1),
        DeciNumber(2),
        DeciNumber(3),
      ]
    `);
  });

  it('can be sorted', () => {
    const originalColumn = Column.fromValues([3, 1, 2].map(toN));
    const sortedColumn = sort(originalColumn, compare);
    expect(originalColumn.values).toMatchInlineSnapshot(`
      Array [
        DeciNumber(3),
        DeciNumber(1),
        DeciNumber(2),
      ]
    `);
    expect(sortedColumn.values).toMatchInlineSnapshot(`
      Array [
        DeciNumber(1),
        DeciNumber(2),
        DeciNumber(3),
      ]
    `);
  });

  it('can derive a column with unique values', () => {
    const originalColumn = Column.fromValues(
      [3, 1, 2, 3, 3, 5, 1, 2, 3, 0].map(toN)
    ) as Column;
    const uniqueValuesColumn = unique(originalColumn, compare);
    expect(originalColumn.values).toMatchInlineSnapshot(`
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

    expect(uniqueValuesColumn.values).toMatchInlineSnapshot(`
      Array [
        DeciNumber(0),
        DeciNumber(1),
        DeciNumber(2),
        DeciNumber(3),
        DeciNumber(5),
      ]
    `);
  });

  it('a column can be sliced', () => {
    const originalColumn = Column.fromValues(
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map(toN)
    );
    const slice1 = slice(originalColumn, 3, 7);
    const slice2 = slice(originalColumn, 7, 9);
    expect(originalColumn.values).toMatchInlineSnapshot(`
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
    expect(slice1.values).toMatchInlineSnapshot(`
      Array [
        DeciNumber(4),
        DeciNumber(5),
        DeciNumber(6),
        DeciNumber(7),
      ]
    `);
    expect(slice2.values).toMatchInlineSnapshot(`
      Array [
        DeciNumber(8),
        DeciNumber(9),
      ]
    `);
  });
});
