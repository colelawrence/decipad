import { Column, Date as DateValue, fromJS } from '../../interpreter/Value';
import { build as t } from '../../type';
import { tableOperators as operators } from './table-operators';
import { F, U } from '../../utils';

describe('table operators', () => {
  it('concatenates tables', () => {
    expect(
      operators.concatenate
        .fnValues?.(
          Column.fromNamedValues(
            [fromJS([1, 2, 3]), fromJS(['Hello', 'World', 'Sup'])],
            ['Numbers', 'Strings']
          ),

          Column.fromNamedValues(
            [fromJS([4]), fromJS(['Mate'])],
            ['Numbers', 'Strings']
          )
        )
        ?.getData()
    ).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(1),
          Fraction(2),
          Fraction(3),
          Fraction(4),
        ],
        Array [
          "Hello",
          "World",
          "Sup",
          "Mate",
        ],
      ]
    `);

    const tNumber = (length: number) =>
      t.table({
        length,
        columnNames: ['Hello'],
        columnTypes: [t.number()],
      });

    expect(
      operators.concatenate.functor?.([tNumber(1), tNumber(2)])
    ).toMatchObject({
      tableLength: 3,
    });
  });

  it('looks things up with a string', () => {
    const tableType = t.table({
      length: 123,
      columnNames: ['Index', 'Value'],
      columnTypes: [t.string(), t.number()],
    });
    const tableValue = Column.fromNamedValues(
      [fromJS(['The Thing']), fromJS([12345])],
      ['Index', 'Value']
    );
    const { functorNoAutomap: functor, fnValuesNoAutomap: fnValues } =
      operators.lookup;

    expect(functor?.([tableType, t.string()]).toString()).toMatchInlineSnapshot(
      `"row [ Index = <string>, Value = <number> ]"`
    );
    expect(fnValues?.([tableValue, fromJS('The Thing')]).getData()).toEqual([
      'The Thing',
      F(12345),
    ]);
    expect(() =>
      fnValues?.([tableValue, fromJS('Not found')])
    ).toThrowErrorMatchingInlineSnapshot(
      `"Could not find a row with the given condition"`
    );
  });

  it('looks things up with a date', () => {
    const tableType = t.table({
      length: 123,
      columnNames: ['Index', 'Value'],
      columnTypes: [t.string(), t.date('day')],
    });
    const tableValue = Column.fromNamedValues(
      [
        fromJS(['The Thing']),
        Column.fromValues([
          DateValue.fromDateAndSpecificity(
            BigInt(new Date('2022-03-01').getTime()),
            'day'
          ),
        ]),
      ],
      ['Index', 'Value']
    );
    const { functorNoAutomap: functor, fnValuesNoAutomap: fnValues } =
      operators.lookup;

    expect(functor?.([tableType, t.string()]).toString()).toMatchInlineSnapshot(
      `"row [ Index = <string>, Value = day ]"`
    );
    expect(fnValues?.([tableValue, fromJS('The Thing')]).getData()).toEqual([
      'The Thing',
      BigInt(new Date('2022-03-01').getTime()),
    ]);
    expect(() =>
      fnValues?.([tableValue, fromJS('Not found')])
    ).toThrowErrorMatchingInlineSnapshot(
      `"Could not find a row with the given condition"`
    );
  });

  it('looks things up with a condition', () => {
    const tableType = t.table({
      length: 3,
      columnNames: ['col1', 'col2'],
      columnTypes: [t.string(), t.number()],
    });
    const tableValue = Column.fromNamedValues(
      [fromJS(['a', 'b', 'c']), fromJS([1, 2, 3])],
      ['Index', 'Value']
    );

    const conditionColumnType = t.column(t.boolean(), 3);
    const conditionColumnValue = fromJS([false, true, true]);

    const { functorNoAutomap: functor, fnValuesNoAutomap: fnValues } =
      operators.lookup;

    expect(
      functor?.([tableType, conditionColumnType]).toString()
    ).toMatchInlineSnapshot(`"row [ col1 = <string>, col2 = <number> ]"`);
    expect(fnValues?.([tableValue, conditionColumnValue]).getData()).toEqual([
      'b',
      F(2),
    ]);
  });

  it('sorts a table by a column', () => {
    const table = t.table({
      length: 3,
      columnNames: ['indexcolumn'],
      columnTypes: [t.number(U('bananas'))],
    });
    const column = t.column(t.number(U('bananas')), 3, undefined, 1);
    expect(operators.sortby.functorNoAutomap!([table, column])).toMatchObject(
      table
    );

    const tableValue = Column.fromValues([
      fromJS([1, 2, 3]),
      fromJS([6, 4, 5]),
    ]);
    const columnValue = tableValue.atIndex(1);
    expect(
      operators.sortby.fnValuesNoAutomap?.([tableValue, columnValue]).getData()
    ).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(2),
          Fraction(3),
          Fraction(1),
        ],
        Array [
          Fraction(4),
          Fraction(5),
          Fraction(6),
        ],
      ]
    `);
  });
});
