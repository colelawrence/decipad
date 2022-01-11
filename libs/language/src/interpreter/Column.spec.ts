import { Column, fromJS } from './Value';

describe('column value', () => {
  it('can be constructed from values', () => {
    const column = Column.fromValues([1, 2, 3].map(fromJS));
    expect(column.getData()).toMatchInlineSnapshot(`
      Array [
        Fraction(1),
        Fraction(2),
        Fraction(3),
      ]
      `);
  });

  it('can be constructed from other columns', () => {
    const column1 = Column.fromValues([1, 2, 3].map(fromJS));
    const column2 = Column.fromValues([4, 5, 6].map(fromJS));
    const column = Column.fromValues([column1, column2]);
    expect(column.getData()).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(1),
          Fraction(2),
          Fraction(3),
        ],
        Array [
          Fraction(4),
          Fraction(5),
          Fraction(6),
        ],
      ]
      `);
  });

  it('can be sorted', () => {
    const originalColumn = Column.fromValues([3, 1, 2].map(fromJS));
    const sortedColumn = originalColumn.sort();
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
      [3, 1, 2, 3, 3, 5, 1, 2, 3, 0].map(fromJS)
    );
    const uniqueValuesColumn = originalColumn.unique();
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
      [1, 2, 3, 4, 5, 6, 7, 8, 9].map(fromJS)
    );
    const slice1 = originalColumn.slice(3, 6);
    const slice2 = originalColumn.slice(7, 9);
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
