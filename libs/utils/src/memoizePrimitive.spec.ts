import { it, expect, beforeEach, vi } from 'vitest';
import { memoizePrimitive } from './memoizePrimitive';

const memoized = vi.fn((obj: number) => 100 + obj);
const fn = memoizePrimitive(memoized);

beforeEach(() => {
  vi.clearAllMocks();
});

it('one call if same thing is passed', () => {
  const obj = 23;
  expect(fn(obj)).toEqual(123);
  expect(fn(obj)).toEqual(123);

  expect(memoized).toHaveBeenCalledTimes(1);
});
