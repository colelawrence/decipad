import { Column, Table, fromJS } from '../../interpreter/Value';
import { build as t } from '../../type';
import { tableGroupingOperators as operators } from './table-grouping-operators';

describe('table splitting and grouping operators', () => {
  it('splitby column', () => {
    const groupByColumnType = t.column(t.number(), 3, undefined, 1);
    const tableType = t.table({
      length: 3,
      columnNames: ['initial_index', 'other_column'],
      columnTypes: [t.string(), groupByColumnType],
    });

    expect(
      operators.splitby.functorNoAutomap?.([tableType, groupByColumnType])
    ).toMatchObject({
      columnNames: ['other_column', 'Values'],
      errorCause: null,
      tableLength: 'unknown',
    });

    const groupByColumn = Column.fromValues(
      [1, 4, 1, 3, 2, 2, 4, 5].map(fromJS)
    );
    const initialIndexColumn = Column.fromValues(
      ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map(fromJS)
    );
    const table = Table.fromNamedColumns(
      [initialIndexColumn, groupByColumn],
      ['initial_index', 'other_column']
    );
    const result = operators.splitby.fnValuesNoAutomap?.(
      [table, groupByColumn],
      [tableType, groupByColumnType]
    );
    expect(result?.getData()).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(1),
          Fraction(2),
          Fraction(3),
          Fraction(4),
          Fraction(5),
        ],
        Array [
          Array [
            Array [
              "a",
              "c",
            ],
          ],
          Array [
            Array [
              "e",
              "f",
            ],
          ],
          Array [
            Array [
              "d",
            ],
          ],
          Array [
            Array [
              "b",
              "g",
            ],
          ],
          Array [
            Array [
              "h",
            ],
          ],
        ],
      ]
      `);
  });
});
