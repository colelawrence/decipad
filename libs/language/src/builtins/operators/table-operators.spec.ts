import { makeContext } from '@decipad/language';
import { Column, Table, DateValue, fromJS } from '../../interpreter/Value';
import { build as t, Type } from '../../type';
import { tableOperators as operators } from './table-operators';
import { F, U } from '../../utils';
import { Realm, RuntimeError } from '../../interpreter';

describe('table operators', () => {
  it('concatenates tables', () => {
    expect(
      operators.concatenate
        .fnValues?.([
          Table.fromNamedColumns(
            [fromJS([1, 2, 3]), fromJS(['Hello', 'World', 'Sup'])],
            ['Numbers', 'Strings']
          ),

          Table.fromNamedColumns(
            [fromJS([4]), fromJS(['Mate'])],
            ['Numbers', 'Strings']
          ),
        ])
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
    const tableValue = Table.fromNamedColumns(
      [fromJS(['The Thing']), fromJS([12345])],
      ['Index', 'Value']
    );
    const { functorNoAutomap: functor, fnValuesNoAutomap: fnValues } =
      operators.lookup;

    expect(functor?.([tableType, t.string()])).toMatchObject({
      rowCellTypes: [{ type: 'string' }, { type: 'number' }],
      rowCellNames: ['Index', 'Value'],
    });
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
    const tableValue = Table.fromNamedColumns(
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

    expect(functor?.([tableType, t.string()])).toMatchObject({
      rowCellTypes: [{ type: 'string' }, { date: 'day' }],
      rowCellNames: ['Index', 'Value'],
    });
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

  it('can lookup a column', () => {
    const table = t.table({
      length: 3,
      columnNames: ['indexcolumn', 'booooleans'],
      columnTypes: [t.number(U('bananas')), t.boolean()],
    });
    const column = t.column(table.columnTypes?.[1] as Type, 3, 'TheTable');

    expect(
      operators.lookup.functorNoAutomap!([column, t.number()])
    ).toMatchObject({
      type: 'boolean',
    });

    const tableValue = Table.fromNamedColumns(
      [
        fromJS([1, 2, 3, 4, 5, 6]),
        fromJS([false, true, true, false, false, true]),
      ],
      ['Nums', 'Bools']
    );
    const columnValue = tableValue.getColumn('Bools');
    const preloadedRealm = new Realm(
      makeContext({
        initialGlobalScope: { TheTable: table },
      })
    );
    preloadedRealm.stack.set('TheTable', tableValue);
    expect(
      operators.lookup
        .fnValuesNoAutomap?.([columnValue, fromJS(3)], [column], preloadedRealm)
        .getData()
    ).toMatchInlineSnapshot(`true`);

    expect(() =>
      operators.lookup.fnValuesNoAutomap?.(
        [columnValue, fromJS(404)],
        [column],
        preloadedRealm
      )
    ).toThrow(RuntimeError);
  });

  it('looks things up with a condition', () => {
    const tableType = t.table({
      length: 3,
      columnNames: ['col1', 'col2'],
      columnTypes: [t.string(), t.number()],
    });
    const tableValue = Table.fromNamedColumns(
      [fromJS(['a', 'b', 'c']), fromJS([1, 2, 3])],
      ['Index', 'Value']
    );

    const conditionColumnType = t.column(t.boolean(), 3);
    const conditionColumnValue = fromJS([false, true, true]);

    const { functorNoAutomap: functor, fnValuesNoAutomap: fnValues } =
      operators.lookup;

    expect(functor?.([tableType, conditionColumnType])).toMatchObject({
      rowCellNames: ['col1', 'col2'],
      rowCellTypes: [{ type: 'string' }, { type: 'number' }],
    });
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
    expect(operators.sortby.functor!([table, column])).toMatchObject(table);

    const tableValue = Table.fromNamedColumns(
      [fromJS([1, 2, 3]), fromJS([6, 4, 5])],
      ['A', 'B']
    );
    const columnValue = tableValue.getColumn('B');
    expect(operators.sortby.fnValues?.([tableValue, columnValue]).getData())
      .toMatchInlineSnapshot(`
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

  it('filters a table by a column', () => {
    const table = t.table({
      length: 3,
      columnNames: ['indexcolumn', 'booooleans'],
      columnTypes: [t.number(U('bananas')), t.boolean()],
    });
    const column = t.column(t.boolean(), 3, undefined, 1);
    expect(operators.filter.functorNoAutomap?.([table, column])).toMatchObject(
      t.table({
        length: 'unknown',
        columnNames: ['indexcolumn', 'booooleans'],
        columnTypes: [t.number(U('bananas')), t.boolean()],
      })
    );

    const tableValue = Table.fromNamedColumns(
      [
        fromJS([1, 2, 3, 4, 5, 6]),
        fromJS([false, true, true, false, false, true]),
      ],
      ['Nums', 'Bools']
    );
    const columnValue = tableValue.getColumn('Bools');
    expect(
      operators.filter.fnValuesNoAutomap?.([tableValue, columnValue]).getData()
    ).toMatchInlineSnapshot(`
      Array [
        Array [
          Fraction(2),
          Fraction(3),
          Fraction(6),
        ],
        Array [
          true,
          true,
          true,
        ],
      ]
    `);
  });
});
