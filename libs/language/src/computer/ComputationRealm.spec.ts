// TODO fix types
/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildType, Column, Date } from '..';
import { parseUTCDate } from '../date';
import { fromJS } from '../interpreter/Value';
import { ComputationRealm } from './ComputationRealm';
import { program } from './testutils';

let realm: ComputationRealm;
beforeEach(() => {
  realm = new ComputationRealm();
});

it('evictStatement', () => {
  realm.locCache.set(['block-0', 1], 'something' as any);
  realm.inferContext.stack.set('A', null as any);

  // Delete from locCache
  realm.evictStatement(program, ['block-0', 1]);

  expect(realm.locCache.get(['block-0', 1])).toEqual(undefined);
  expect(realm.inferContext.stack.has('A')).toBe(true);

  // Delete var A
  realm.evictStatement(program, ['block-0', 0]);
  expect(realm.inferContext.stack.has('A')).toBe(false);
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
    Column.fromNamedValues(
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
    Column.fromNamedValues([fromJS([1, 2])], ['Nums'])
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
    Column.fromNamedValues(
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
