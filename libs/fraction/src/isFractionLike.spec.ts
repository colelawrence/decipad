import { F, isFractionLike } from '.';

test('isFractionLike', () => {
  expect(isFractionLike(F(1))).toEqual(true);
  expect(isFractionLike(2)).toEqual(false);
  expect(isFractionLike({})).toEqual(false);
  expect(isFractionLike({ d: 1, n: 2, s: 1 })).toEqual(true);
  expect(isFractionLike({ d: 1n, n: 2n, s: 1n })).toEqual(true);
  expect(isFractionLike({ d: '1', n: 2n, s: '1' })).toEqual(true);
});
