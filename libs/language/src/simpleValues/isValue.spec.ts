import { isValue } from './isValue';

it('returns true on empty expression', () => {
  expect(isValue('')).toBeTruthy();
});

it('returns true on percentage', () => {
  expect(isValue('10%')).toBeTruthy();
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

it('returns true on prefix units', () => {
  expect(isValue('$10')).toBeTruthy();
});

it('returns false on invalid statement', () => {
  expect(isValue('not a value 2 * asdm ./x.cz.23089')).toBeFalsy();
});

it('returns false on a basic calculations', () => {
  expect(isValue('1 + 1')).toBeFalsy();
});

it("returns false when number isn't the root", () => {
  expect(isValue('10 / (1000 m)')).toBeFalsy();
});

it('knows about pow', () => {
  expect(isValue('10 km/s**2')).toBeTruthy();
});

it('takes a set of defined vars', () => {
  expect(isValue('10 km/banana', new Set(['orange']))).toBeTruthy();
  expect(isValue('10 km/orange', new Set(['orange']))).toBeFalsy();
});

it('knows about ** -2', () => {
  expect(isValue('10 km s**-2')).toBeTruthy();
  expect(isValue('10 km * s**-2')).toBeTruthy();
  expect(isValue('10 km / s ** 2')).toBeTruthy();
});

it('only allows numeric powers after **', () => {
  expect(isValue('10 meters ** bananath')).toBeFalsy();
  expect(isValue('10 meters ^ second')).toBeFalsy();
});

it('doesnt allow pow at the root', () => {
  expect(isValue('10 ** 2')).toBeFalsy();
});

it('returns false on a calculation with units', () => {
  expect(isValue('20 km + 10')).toBeFalsy();
});

it('returns false on complex units with calculations', () => {
  expect(isValue('100 km per hour newtons * 300 hours')).toBeFalsy();
});
