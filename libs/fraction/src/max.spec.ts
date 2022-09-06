import { max, F } from '.';

test('max', () => {
  expect(max(F(1))).toEqual(F(1));
  expect(max(F(2), F(1))).toEqual(F(2));
  expect(max(F(-2), F(1), F(-3), F(4), F(3))).toEqual(F(4));
});
