import { Computer } from '@decipad/computer';
import { F } from '@decipad/fraction';
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
        unit: {
          type: 'units',
          args: [
            {
              unit: 'banana',
              exp: F(1),
              multiplier: F(1),
              known: false,
            },
          ],
        },
      },
      '1'
    )
  ).toBe('1 banana');
  expect(
    formatCell(
      computer,
      {
        kind: 'number',
        unit: {
          type: 'units',
          args: [
            {
              unit: 'banana',
              exp: F(1),
              multiplier: F(1),
              known: false,
            },
          ],
        },
      },
      '10'
    )
  ).toBe('10 bananas');
  expect(
    formatCell(
      computer,
      {
        kind: 'number',
        unit: {
          type: 'units',
          args: [
            {
              unit: 'banana',
              exp: F(1),
              multiplier: F(1),
              known: false,
            },
          ],
        },
      },
      'text'
    )
  ).toBe('0 bananas');
});
