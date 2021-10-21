// TODO fix types
/* eslint-disable @typescript-eslint/no-explicit-any */
import { buildType, Column } from '..';
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
      columnTypes: [],
      columnNames: [],
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
