import { merge } from './merge';

it('merges two number arrays', () => {
  expect(merge([1, 2, undefined], [6, 7, 8])).toMatchObject([1, 2, 8]);
});

it('merges two arrays of different sizes', () => {
  expect(merge([1, undefined], [10, 20, 30, 50, 80])).toMatchObject([
    1, 20, 30, 50, 80,
  ]);
});

it('merges two arrays of different sizes swapped positions', () => {
  expect(merge([undefined, 20, 30, 50, 80], [1, undefined])).toMatchObject([
    1, 20, 30, 50, 80,
  ]);
});
