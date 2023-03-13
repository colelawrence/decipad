import { formatUTCDate } from './formatUTCDate';

it('regression: formats dates correctly', () => {
  // NOTE: timezone has been set in jest.config.js so that this doesn't run in default UTC time
  const date = new Date('2022-01-01T00:00:00.000Z');
  expect(formatUTCDate(date, 'yyyy-MM-dd HH:mm')).toMatchInlineSnapshot(
    `"2022-01-01 00:00"`
  );

  const summerTimeDate = new Date('2022-08-01T00:00:00.000Z');
  expect(
    formatUTCDate(summerTimeDate, 'yyyy-MM-dd HH:mm')
  ).toMatchInlineSnapshot(`"2022-08-01 00:00"`);
});
