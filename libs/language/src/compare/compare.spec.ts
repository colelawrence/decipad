import { N } from '@decipad/number';
import { fromJS } from '..';
import { compare } from './compare';

it('can compare columns', () => {
  expect(compare(fromJS([1, 2]), fromJS([1, 2]))).toEqual(0);
  expect(compare(fromJS([2, 2]), fromJS([1, 2]))).toEqual(1);
  expect(compare(fromJS([0, 2]), fromJS([1, 2]))).toEqual(-1);

  expect(compare([1, 2], [1, 2])).toEqual(0);
  expect(compare([2, 2], [1, 2])).toEqual(1);
  expect(compare([0, 2], [1, 2])).toEqual(-1);
});

it('finds columns with different lengths to be different', () => {
  expect(compare([1, 2, 3], [1, 2])).toEqual(1);
  expect(compare([1, 2], [1, 2, 3])).toEqual(-1);
});

it('compares numbers', () => {
  expect(compare(2, 2)).toBe(0);
  expect(compare(1, 2)).toBe(-1);
  expect(compare(2, 1)).toBe(1);
});

it('compares bigints', () => {
  expect(compare(2n, 2n)).toBe(0);
  expect(compare(1n, 2n)).toBe(-1);
  expect(compare(2n, 1n)).toBe(1);
});

it('compares fractions', () => {
  expect(compare(N(2), N(2))).toBe(0);
  expect(compare(N(1), N(2))).toBe(-1);
  expect(compare(N(2), N(1))).toBe(1);
});

it('compares fraction-likes', () => {
  expect(compare(N(2), N(2))).toBe(0);
  expect(compare(N(1), N(2))).toBe(-1);
  expect(compare(N(2), N(1))).toBe(1);
});

it('compares strings', () => {
  expect(compare('a', 'a')).toBe(0);
  expect(compare('', 'a')).toBe(-1);
  expect(compare('a', '')).toBe(1);
});

it('compares booleans', () => {
  expect(compare(true, true)).toBe(0);
  expect(compare(false, false)).toBe(0);
  expect(compare(false, true)).toBe(-1);
  expect(compare(true, false)).toBe(1);
});
