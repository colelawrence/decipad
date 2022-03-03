import { Column, fromJS, ValueTransforms } from './Value';

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
    const sortedColumn = ValueTransforms.sort(originalColumn);
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
    const originalColumn = fromJS([3, 1, 2, 3, 3, 5, 1, 2, 3, 0]) as Column;
    const uniqueValuesColumn = ValueTransforms.unique(originalColumn);
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
    const originalColumn = fromJS([1, 2, 3, 4, 5, 6, 7, 8, 9]) as Column;
    const slice1 = ValueTransforms.slice(originalColumn, 3, 6);
    const slice2 = ValueTransforms.slice(originalColumn, 7, 9);
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
