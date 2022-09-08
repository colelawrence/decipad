import { columnNameFromIndex } from './columnNameFromIndex';

it('starts on A', () => {
  expect(columnNameFromIndex(0)).toBe('A');
});

it('has Z', () => {
  expect(columnNameFromIndex(25)).toBe('Z');
});

it('extends beyond Z (1)', () => {
  expect(columnNameFromIndex(26)).toBe('AA');
});

it('extends beyond Z (2)', () => {
  expect(columnNameFromIndex(27)).toBe('AB');
});

it('extends beyond Z (3)', () => {
  expect(columnNameFromIndex(26 + 25)).toBe('AZ');
});

it('carries correctly', () => {
  expect(columnNameFromIndex(26 + 25 + 1)).toBe('BA');
});
