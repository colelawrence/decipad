import { Computer } from '@decipad/computer';
import { N } from '@decipad/number';
import { formatCell } from './formatCell';

it('formats cell value according to the column type', () => {
  const computer = new Computer();
  expect(formatCell(computer, { kind: 'string' }, 'text')).toBe('text');
  expect(
    formatCell(computer, { kind: 'date', date: 'day' }, '2021-01-01')
  ).toBe('2021-01-01');
  expect(formatCell(computer, { kind: 'number', unit: null }, '1')).toBe('1');
  expect(
    formatCell(
      computer,
      {
        kind: 'number',
        unit: [
          {
            unit: 'banana',
            exp: N(1),
            multiplier: N(1),
            known: false,
          },
        ],
      },
      '1'
    )
  ).toBe('1 banana');
  expect(
    formatCell(
      computer,
      {
        kind: 'number',
        unit: [
          {
            unit: 'banana',
            exp: N(1),
            multiplier: N(1),
            known: false,
          },
        ],
      },
      '10'
    )
  ).toBe('10 bananas');
  expect(
    formatCell(
      computer,
      {
        kind: 'number',
        unit: [
          {
            unit: 'banana',
            exp: N(1),
            multiplier: N(1),
            known: false,
          },
        ],
      },
      'invalid text'
    )
  ).toBe('— bananas');
});
