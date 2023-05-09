// TODO fix types
/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Column,
  Table,
  DateValue,
  fromJS,
  buildType,
  parseUTCDate,
} from '@decipad/language';
import { testBlocks } from '../testUtils';
import { ComputationRealm } from './ComputationRealm';

let realm: ComputationRealm;
beforeEach(() => {
  realm = new ComputationRealm();
});

const program = testBlocks('A = 1', 'Unused = 1', 'Func(x) = 1');

it('evictStatement', () => {
  realm.locCache.set('block-1', 'something' as any);
  realm.inferContext.stack.set('A', 'something' as any);
  realm.inferContext.functionDefinitions.set('Func', 'something' as any);

  // Delete from locCache
  realm.evictStatement(program, 'block-1');

  expect(realm.locCache.get('block-1')).toEqual(undefined);
  expect(realm.inferContext.stack.has('A')).toBe(true);
  expect(realm.inferContext.functionDefinitions.has('Func')).toBe(true);

  // Delete var A
  realm.evictStatement(program, 'block-0');
  realm.evictStatement(program, 'block-2');
  expect(realm.inferContext.stack.has('A')).toBe(false);
  expect(realm.inferContext.functionDefinitions.has('Func')).toBe(false);
});

describe('getIndexLabels', () => {
  it('getIndexLabels', async () => {
    realm.inferContext.stack.set(
      'DimName',
      buildType.table({
        indexName: 'DimName',
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

    expect(await realm.getIndexLabels()).toMatchInlineSnapshot(`
      Map {
        "DimName" => Array [
          "One",
          "Two",
          "Three",
        ],
      }
    `);
  });

  it('getIndexLabels for Sets', async () => {
    realm.inferContext.stack.set(
      'DimName',
      buildType.column(buildType.string(), 'DimName')
    );
    realm.interpreterRealm.stack.set(
      'DimName',
      fromJS(['One', 'Two', 'Three'])
    );

    expect(await realm.getIndexLabels()).toMatchInlineSnapshot(`
      Map {
        "DimName" => Array [
          "One",
          "Two",
          "Three",
        ],
      }
    `);
  });

  it('getIndexLabels with numbers', async () => {
    realm.inferContext.stack.set(
      'Diabetes',
      buildType.table({
        indexName: 'Diabetes',
        columnTypes: [buildType.number()],
        columnNames: ['Nums'],
      })
    );

    realm.interpreterRealm.stack.set(
      'Diabetes',
      Table.fromNamedColumns([fromJS([1, 2])], ['Nums'])
    );

    expect(await realm.getIndexLabels()).toMatchInlineSnapshot(`
      Map {
        "Diabetes" => Array [
          "1",
          "2",
        ],
      }
    `);
  });

  it('getIndexLabels with dates', async () => {
    realm.inferContext.stack.set(
      'Dates',
      buildType.table({
        indexName: 'Dates',
        columnTypes: [buildType.date('month')],
        columnNames: ['Dates'],
      })
    );

    realm.interpreterRealm.stack.set(
      'Dates',
      Table.fromNamedColumns(
        [
          Column.fromValues([
            DateValue.fromDateAndSpecificity(parseUTCDate('2020-01'), 'month'),
          ]),
        ],
        ['Dates']
      )
    );

    expect(await realm.getIndexLabels()).toMatchInlineSnapshot(`
      Map {
        "Dates" => Array [
          "2020-01",
        ],
      }
    `);
  });
});
