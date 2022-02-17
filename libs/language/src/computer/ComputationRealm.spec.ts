// TODO fix types
/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildType, Column, Table, Date } from '..';
import { parseUTCDate } from '../date';
import { fromJS } from '../interpreter/Value';
import { assign, funcDef, l } from '../utils';
import { ComputationRealm } from './ComputationRealm';
import { testBlocks } from './testutils';

let realm: ComputationRealm;
beforeEach(() => {
  realm = new ComputationRealm();
});

const program = testBlocks(
  assign('A', l(1)),
  assign('Unused', l(1)),
  funcDef('Func', [], l(1))
);

it('evictStatement', () => {
  realm.locCache.set(['block-1', 0], 'something' as any);
  realm.inferContext.stack.set('A', 'something' as any);
  realm.inferContext.functionDefinitions.set('Func', 'something' as any);

  // Delete from locCache
  realm.evictStatement(program, ['block-1', 0]);

  expect(realm.locCache.get(['block-1', 0])).toEqual(undefined);
  expect(realm.inferContext.stack.has('A')).toBe(true);
  expect(realm.inferContext.functionDefinitions.has('Func')).toBe(true);

  // Delete var A
  realm.evictStatement(program, ['block-0', 0]);
  realm.evictStatement(program, ['block-2', 0]);
  expect(realm.inferContext.stack.has('A')).toBe(false);
  expect(realm.inferContext.functionDefinitions.has('Func')).toBe(false);
});

it('getIndexLabels', () => {
  realm.inferContext.stack.set(
    'DimName',
    buildType.table({
      indexName: 'DimName',
      length: 1,
      columnTypes: [buildType.string(), buildType.number()],
      columnNames: ['Names', 'Numbers'],
    })
  );
  realm.interpreterRealm.stack.set(
    'DimName',
    Table.fromNamedColumns(
      [fromJS(['One', 'Two', 'Three']), fromJS([1, 2, 3])],
      ['Names', 'Numbers']
    )
  );

  expect(realm.getIndexLabels()).toMatchInlineSnapshot(`
    Map {
      "DimName" => Array [
        "One",
        "Two",
        "Three",
      ],
    }
  `);
});

it('getIndexLabels with numbers', () => {
  realm.inferContext.stack.set(
    'Diabetes',
    buildType.table({
      indexName: 'Diabetes',
      length: 1,
      columnTypes: [buildType.number()],
      columnNames: ['Nums'],
    })
  );

  realm.interpreterRealm.stack.set(
    'Diabetes',
    Table.fromNamedColumns([fromJS([1, 2])], ['Nums'])
  );

  expect(realm.getIndexLabels()).toMatchInlineSnapshot(`
    Map {
      "Diabetes" => Array [
        "1",
        "2",
      ],
    }
  `);
});

it('getIndexLabels with dates', () => {
  realm.inferContext.stack.set(
    'Dates',
    buildType.table({
      indexName: 'Dates',
      length: 1,
      columnTypes: [buildType.date('month')],
      columnNames: ['Dates'],
    })
  );

  realm.interpreterRealm.stack.set(
    'Dates',
    Table.fromNamedColumns(
      [
        Column.fromValues([
          Date.fromDateAndSpecificity(parseUTCDate('2020-01'), 'month'),
        ]),
      ],
      ['Dates']
    )
  );

  expect(realm.getIndexLabels()).toMatchInlineSnapshot(`
    Map {
      "Dates" => Array [
        "2020-01",
      ],
    }
  `);
});
