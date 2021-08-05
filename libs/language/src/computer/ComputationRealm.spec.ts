// TODO fix types
/* eslint-disable @typescript-eslint/no-explicit-any */
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
