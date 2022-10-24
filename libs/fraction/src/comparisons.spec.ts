import {
  lessThan,
  lessThanOrEqualTo,
  greaterThan,
  greaterThanOrEqualTo,
  F,
} from '.';

test('comparisons', () => {
  expect(lessThan(F(1), F(2))).toEqual(true);
  expect(lessThan(F(2), F(1))).toEqual(false);
  expect(lessThanOrEqualTo(F(2), F(2))).toEqual(true);
  expect(lessThanOrEqualTo(F(1), F(2))).toEqual(true);
  expect(lessThanOrEqualTo(F(3), F(2))).toEqual(false);
  expect(greaterThan(F(1), F(2))).toEqual(false);
  expect(greaterThan(F(2), F(1))).toEqual(true);
  expect(greaterThanOrEqualTo(F(2), F(2))).toEqual(true);
  expect(greaterThanOrEqualTo(F(1), F(2))).toEqual(false);
  expect(greaterThanOrEqualTo(F(3), F(2))).toEqual(true);
});
