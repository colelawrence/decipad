import { formatCell } from './formatCell';

it('formats cell value according to the column type', () => {
  expect(formatCell({ kind: 'string' }, 'text')).toBe('text');
  expect(formatCell({ kind: 'date', date: 'day' }, '2021-01-01')).toBe(
    '2021-01-01'
  );
  expect(formatCell({ kind: 'number', unit: null }, '1')).toBe('1');
  expect(
    formatCell(
      {
        kind: 'number',
        unit: {
          type: 'units',
          args: [
            {
              unit: 'banana',
              exp: { n: 1, d: 1, s: 1 },
              multiplier: { n: 1, d: 1, s: 1 },
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
      {
        kind: 'number',
        unit: {
          type: 'units',
          args: [
            {
              unit: 'banana',
              exp: { n: 1, d: 1, s: 1 },
              multiplier: { n: 1, d: 1, s: 1 },
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
      {
        kind: 'number',
        unit: {
          type: 'units',
          args: [
            {
              unit: 'banana',
              exp: { n: 1, d: 1, s: 1 },
              multiplier: { n: 1, d: 1, s: 1 },
              known: false,
            },
          ],
        },
      },
      'text'
    )
  ).toBe('0 bananas');
});
