import { it, expect, beforeEach } from 'vitest';
/* eslint-disable @typescript-eslint/no-explicit-any */
// eslint-disable-next-line no-restricted-imports
import { testProgramBlocks } from '../testUtils';
import { ComputationRealm } from './ComputationRealm';

let realm: ComputationRealm;
beforeEach(() => {
  realm = new ComputationRealm();
});

const program = testProgramBlocks('A = 1', 'Unused = 1', 'Func(x) = 1');

it('evictStatement', () => {
  realm.locCache.set('block-1', 'something' as any);
  realm.inferContext.stack.set('A', 'something' as any);
  realm.inferContext.stack.set('Func', 'something' as any);

  // Delete from locCache
  realm.evictStatement(program, 'block-1');

  expect(realm.locCache.get('block-1')).toEqual(undefined);
  expect(realm.inferContext.stack.has('A')).toBe(true);
  expect(realm.inferContext.stack.has('Func')).toBe(true);

  // Delete var A
  realm.evictStatement(program, 'block-0');
  realm.evictStatement(program, 'block-2');
  expect(realm.inferContext.stack.has('A')).toBe(false);
  expect(realm.inferContext.stack.has('Func')).toBe(false);
});
