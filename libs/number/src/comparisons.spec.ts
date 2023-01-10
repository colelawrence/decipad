import {
  lessThan,
  lessThanOrEqualTo,
  greaterThan,
  greaterThanOrEqualTo,
  N,
} from '.';

test('comparisons', () => {
  expect(lessThan(N(1), N(2))).toEqual(true);
  expect(lessThan(N(2), N(1))).toEqual(false);
  expect(lessThanOrEqualTo(N(2), N(2))).toEqual(true);
  expect(lessThanOrEqualTo(N(1), N(2))).toEqual(true);
  expect(lessThanOrEqualTo(N(3), N(2))).toEqual(false);
  expect(greaterThan(N(1), N(2))).toEqual(false);
  expect(greaterThan(N(2), N(1))).toEqual(true);
  expect(greaterThanOrEqualTo(N(2), N(2))).toEqual(true);
  expect(greaterThanOrEqualTo(N(1), N(2))).toEqual(false);
  expect(greaterThanOrEqualTo(N(3), N(2))).toEqual(true);
});
