import { describe, it, expect } from 'vitest';
import { N, setupDeciNumberSnapshotSerializer } from '@decipad/number';
// eslint-disable-next-line no-restricted-imports
// eslint-disable-next-line no-restricted-imports
import {
  Value,
  materializeOneResult,
  buildType as t,
} from '@decipad/language-types';
import { tableOperators as operators } from './table-operators';
import { miscOperators } from './misc-operators';
import { U, makeContext } from '../utils/testUtils';
import type { FullBuiltinSpec } from '../types';

setupDeciNumberSnapshotSerializer();

describe('table operators', () => {
  const emptyMeta = () => ({ labels: undefined });
  it('concatenates tables', async () => {
    expect(
      await materializeOneResult(
        await (
          await (miscOperators.concat as FullBuiltinSpec).fnValuesNoAutomap?.(
            [
              Value.Table.fromNamedColumns(
                [
                  Value.fromJS([1, 2, 3]),
                  Value.fromJS(['Hello', 'World', 'Sup']),
                ],
                ['Numbers', 'Strings'],
                undefined
              ),

              Value.Table.fromNamedColumns(
                [Value.fromJS([4]), Value.fromJS(['Mate'])],
                ['Numbers', 'Strings'],
                undefined
              ),
            ],
            [
              t.table({
                indexName: 'Numbers',
                columnTypes: [t.number(), t.string()],
                columnNames: ['Numbers', 'Strings'],
              }),
              t.table({
                indexName: 'Numbers',
                columnTypes: [t.number(), t.string()],
                columnNames: ['Numbers', 'Strings'],
              }),
            ],
            makeContext(),
            []
          )
        )?.getData()
      )
    ).toMatchInlineSnapshot(`
      [
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 3n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 4n,
            "s": 1n,
          },
        ],
        [
          "Hello",
          "World",
          "Sup",
          "Mate",
        ],
      ]
    `);
  });

  it('concatenates tables whose column orders differ', async () => {
    const t1 = Value.Table.fromNamedColumns(
      [Value.fromJS([1, 2, 3]), Value.fromJS(['a', 'b', 'c'])],
      ['numbers', 'strings'],
      undefined
    );

    const t1Type = t.table({
      indexName: 'numbers',
      columnTypes: [t.number(), t.string()],
      columnNames: ['numbers', 'strings'],
    });

    const t2 = Value.Table.fromNamedColumns(
      [Value.fromJS(['d', 'e', 'f']), Value.fromJS([4, 5, 6])],
      ['strings', 'numbers'],
      undefined
    );
    const t2Type = t.table({
      indexName: 'numbers',
      columnTypes: [t.number(), t.string()],
      columnNames: ['numbers', 'strings'],
    });

    const result = await materializeOneResult(
      (
        await (miscOperators.concat as FullBuiltinSpec).fnValuesNoAutomap?.(
          [t1, t2],
          [t1Type, t2Type],
          makeContext(),
          []
        )
      )?.getData()
    );

    expect(result).toMatchInlineSnapshot(`
      [
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 3n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 4n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 5n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 6n,
            "s": 1n,
          },
        ],
        [
          "a",
          "b",
          "c",
          "d",
          "e",
          "f",
        ],
      ]
    `);
  });

  it('functor passes when given correct inputs', async () => {
    const tNumber = t.table({
      columnNames: ['Hello'],
      columnTypes: [t.number()],
    });

    expect(
      await (miscOperators.concat as FullBuiltinSpec).functorNoAutomap?.(
        [tNumber, tNumber],
        [],
        makeContext()
      )
    ).toMatchObject({
      errorCause: null,
    });
  });

  it('functor erros when given incorrect inputs whose order looks correct', () => {
    const t1 = t.table({
      columnNames: ['str', 'num'],
      columnTypes: [t.string(), t.number()],
    });

    const t2 = t.table({
      columnNames: ['num', 'str'],
      columnTypes: [t.string(), t.number()],
    });

    expect(
      (miscOperators.concat as FullBuiltinSpec).functorNoAutomap?.(
        [t1, t2],
        [],
        makeContext()
      )
    ).not.toMatchObject({
      errorCause: null,
    });
  });

  it('sorts a table by a column', async () => {
    const table = t.table({
      columnNames: ['indexcolumn'],
      columnTypes: [t.number(U('bananas'))],
    });
    const column = t.column(t.number(U('bananas')), undefined, 1);
    expect(
      await (operators.sortby as FullBuiltinSpec).functor?.(
        [table, column],
        [],
        makeContext()
      )
    ).toMatchObject(table);

    const tableValue = Value.Table.fromNamedColumns(
      [Value.fromJS([1, 2, 3]), Value.fromJS([6, 4, 5])],
      ['A', 'B'],
      undefined
    );
    const columnValue = tableValue.getColumn('B');

    expect(
      await materializeOneResult(
        (
          await (operators.sortby as FullBuiltinSpec).fnValues!(
            [tableValue, columnValue],
            [],
            makeContext(),
            []
          )
        ).getData()
      )
    ).toMatchInlineSnapshot(`
      [
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 3n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 1n,
            "s": 1n,
          },
        ],
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 4n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 5n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 6n,
            "s": 1n,
          },
        ],
      ]
    `);
  });

  it('filters a table by a column', async () => {
    const table = t.table({
      columnNames: ['indexcolumn', 'booooleans'],
      columnTypes: [t.number(U('bananas')), t.boolean()],
    });
    const column = t.column(t.boolean(), undefined, 1);
    expect(
      await (operators.filter as FullBuiltinSpec).functorNoAutomap!(
        [table, column],
        [],
        makeContext()
      )
    ).toMatchObject(
      t.table({
        columnNames: ['indexcolumn', 'booooleans'],
        columnTypes: [t.number(U('bananas')), t.boolean()],
      })
    );

    const tableValue = Value.Table.fromNamedColumns(
      [
        Value.fromJS([1, 2, 3, 4, 5, 6]),
        Value.fromJS([false, true, true, false, false, true]),
      ],
      ['Nums', 'Bools'],
      undefined
    );
    const columnValue = tableValue.getColumn('Bools');
    expect(
      await materializeOneResult(
        (
          await (operators.filter as FullBuiltinSpec).fnValuesNoAutomap!(
            [tableValue, columnValue],
            [],
            makeContext(),
            []
          )
        ).getData()
      )
    ).toMatchInlineSnapshot(`
      [
        [
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 2n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 3n,
            "s": 1n,
          },
          DeciNumber {
            "d": 1n,
            "infinite": false,
            "n": 6n,
            "s": 1n,
          },
        ],
        [
          true,
          true,
          true,
        ],
      ]
    `);
  });

  it('looks things up with a string', async () => {
    const tableType = t.table({
      columnNames: ['Index', 'Value'],
      columnTypes: [t.string(), t.number()],
    });
    const needleType = t.string();
    const tableValue = Value.Table.fromNamedColumns(
      [Value.fromJS(['The Thing']), Value.fromJS([12345])],
      ['Index', 'Value'],
      undefined
    );
    const { functorNoAutomap: functor, fnValuesNoAutomap: fnValues } =
      operators.lookup as FullBuiltinSpec;

    expect(
      await functor?.([tableType, t.string()], [], makeContext())
    ).toMatchObject({
      rowCellTypes: [{ type: 'string' }, { type: 'number' }],
      rowCellNames: ['Index', 'Value'],
    });
    expect(
      await (
        await fnValues!(
          [tableValue, Value.fromJS('The Thing')],
          [tableType, needleType],
          makeContext(),
          []
        )
      ).getData()
    ).toEqual(['The Thing', N(12345)]);
    await expect(async () =>
      fnValues!(
        [tableValue, Value.fromJS('Not found')],
        [tableType, needleType],
        makeContext(),
        []
      )
    ).rejects.toThrow(`Could not find a row with the given condition`);
  });

  it('looks things up with a date', async () => {
    const tableType = t.table({
      columnNames: ['Index', 'Value'],
      columnTypes: [t.string(), t.date('day')],
    });
    const needleType = t.string();
    const tableValue = Value.Table.fromNamedColumns(
      [
        Value.fromJS(['The Thing']),
        Value.Column.fromValues(
          [
            Value.DateValue.fromDateAndSpecificity(
              BigInt(new Date('2022-03-01').getTime()),
              'day'
            ),
          ],
          emptyMeta
        ),
      ],
      ['Index', 'Value'],
      undefined
    );
    const { functorNoAutomap: functor, fnValuesNoAutomap: fnValues } =
      operators.lookup as FullBuiltinSpec;

    expect(
      await functor?.([tableType, t.string()], [], makeContext())
    ).toMatchObject({
      rowCellTypes: [{ type: 'string' }, { date: 'day' }],
      rowCellNames: ['Index', 'Value'],
    });
    expect(
      await (
        await fnValues!(
          [tableValue, Value.fromJS('The Thing')],
          [tableType, needleType],
          makeContext(),
          []
        )
      ).getData()
    ).toEqual(['The Thing', BigInt(new Date('2022-03-01').getTime())]);
    await expect(async () =>
      fnValues?.(
        [tableValue, Value.fromJS('Not found')],
        [tableType, needleType],
        makeContext(),
        []
      )
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `[Error: Could not find a row with the given condition]`
    );
  });

  it('looks things up with a condition', async () => {
    const tableType = t.table({
      columnNames: ['col1', 'col2'],
      columnTypes: [t.string(), t.number()],
    });
    const tableValue = Value.Table.fromNamedColumns(
      [Value.fromJS(['a', 'b', 'c']), Value.fromJS([1, 2, 3])],
      ['Index', 'Value'],
      undefined
    );

    const conditionColumnType = t.column(t.boolean());
    const conditionColumnValue = Value.fromJS([false, true, true]);

    const { functorNoAutomap: functor, fnValuesNoAutomap: fnValues } =
      operators.lookup as FullBuiltinSpec;

    expect(
      await functor?.([tableType, conditionColumnType], [], makeContext())
    ).toMatchObject({
      rowCellNames: ['col1', 'col2'],
      rowCellTypes: [{ type: 'string' }, { type: 'number' }],
    });
    expect(
      await (
        await fnValues!(
          [tableValue, conditionColumnValue],
          [tableType, conditionColumnType],
          makeContext(),
          []
        )
      ).getData()
    ).toEqual(['b', N(2)]);
  });
});
