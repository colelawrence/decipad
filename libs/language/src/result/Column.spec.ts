import { F as FF } from '../utils';
import { Column } from './Column';
import { sort, unique, slice } from './ResultTransforms';

const F = (n: number) => FF(n);

describe('column value', () => {
  it('can be constructed from values', () => {
    const column = Column.fromValues([1, 2, 3].map(F));
    expect(column.rowCount).toBe(3);
    expect(column.getData()).toMatchInlineSnapshot(`
      Array [
        Fraction(1),
        Fraction(2),
        Fraction(3),
      ]
      `);
  });

  it('can be sorted', () => {
    const originalColumn = Column.fromValues([3, 1, 2].map(F));
    const sortedColumn = sort(originalColumn);
    expect(originalColumn.getData()).toMatchInlineSnapshot(`
      Array [
        Fraction(3),
        Fraction(1),
        Fraction(2),
      ]
      `);
    expect(sortedColumn.getData()).toMatchInlineSnapshot(`
      Array [
        Fraction(1),
        Fraction(2),
        Fraction(3),
      ]
      `);
  });

  it('can derive a column with unique values', () => {
    const originalColumn = Column.fromValues(
      [3, 1, 2, 3, 3, 5, 1, 2, 3, 0].map(F)
    ) as Column;
    const uniqueValuesColumn = unique(originalColumn);
    expect(originalColumn.getData()).toMatchInlineSnapshot(`
      Array [
        Fraction(3),
        Fraction(1),
        Fraction(2),
        Fraction(3),
        Fraction(3),
        Fraction(5),
        Fraction(1),
        Fraction(2),
        Fraction(3),
        Fraction(0),
      ]
      `);

    expect(uniqueValuesColumn.getData()).toMatchInlineSnapshot(`
      Array [
        Fraction(0),
        Fraction(1),
        Fraction(2),
        Fraction(3),
        Fraction(5),
      ]
      `);
  });

  it('a column can be sliced', () => {
    const originalColumn = Column.fromValues(
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map(F)
    );
    const slice1 = slice(originalColumn, 3, 7);
    const slice2 = slice(originalColumn, 7, 9);
    expect(originalColumn.getData()).toMatchInlineSnapshot(`
      Array [
        Fraction(1),
        Fraction(2),
        Fraction(3),
        Fraction(4),
        Fraction(5),
        Fraction(6),
        Fraction(7),
        Fraction(8),
        Fraction(9),
      ]
    `);
    expect(slice1.getData()).toMatchInlineSnapshot(`
      Array [
        Fraction(4),
        Fraction(5),
        Fraction(6),
        Fraction(7),
      ]
    `);
    expect(slice2.getData()).toMatchInlineSnapshot(`
      Array [
        Fraction(8),
        Fraction(9),
      ]
    `);
  });
});
