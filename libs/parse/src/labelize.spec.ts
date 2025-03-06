import { it, expect } from 'vitest';
import { labelize } from './labelize';
import { fasterNumber } from './fasterNumber';

it('should labelize boolean', () => {
  expect(labelize(true, { kind: 'boolean' })).toBe('true');
  expect(labelize(false, { kind: 'boolean' })).toBe('false');
});

it('should labelize date', () => {
  const dateBigInt = `${Number(new Date('2023-01-01'))}`;

  expect(labelize(dateBigInt, { kind: 'date', date: 'day' })).toBe(
    '2023-01-01'
  );
  expect(labelize(dateBigInt, { kind: 'date', date: 'month' })).toBe('2023-01');
  expect(labelize(dateBigInt, { kind: 'date', date: 'year' })).toBe('2023');
});

it('should labelize numbers', () => {
  const number1 = fasterNumber('1234567890');
  const number2 = fasterNumber('1234567');
  const number3 = fasterNumber('1234');
  const number4 = fasterNumber('1.234');

  expect(labelize(number1, { kind: 'number' })).toBe('1.2B');
  expect(labelize(number2, { kind: 'number' })).toBe('1.2M');
  expect(labelize(number3, { kind: 'number' })).toBe('1.2k');
  expect(labelize(number4, { kind: 'number' })).toBe('1.234');
});
