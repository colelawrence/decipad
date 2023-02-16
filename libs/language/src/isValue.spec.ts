import { isValue } from './isValue';

it('returns true on empty expression', () => {
  expect(isValue('')).toBeTruthy();
});

it('returns true on basic value', () => {
  expect(isValue('200')).toBeTruthy();
});

it('returns true on a value with a unit', () => {
  expect(isValue('1 a')).toBeTruthy();
});

it('returns true on complex units', () => {
  expect(isValue('100 km per hour newtons')).toBeTruthy();
});

it('returns false on invalid statement', () => {
  expect(isValue('not a value 2 * asdm ./x.cz.23089')).toBeFalsy();
});

it('returns false on a basic calculations', () => {
  expect(isValue('1 + 1')).toBeFalsy();
});

it('returns false on a calculation with units', () => {
  expect(isValue('20 km + 10')).toBeFalsy();
});

it('returns false on complex units with calculations', () => {
  expect(isValue('100 km per hour newtons * 300 hours')).toBeFalsy();
});
