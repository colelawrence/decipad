import { min } from '.';
import { F } from './utils';

test('min', () => {
  expect(min(F(1))).toEqual(F(1));
  expect(min(F(2), F(1))).toEqual(F(1));
  expect(min(F(-2), F(1), F(-3), F(4), F(3))).toEqual(F(-3));
});
