import { render } from '@testing-library/react';
import { runCode } from '../../test-utils';

import { DateResult, formatUTCDate } from './DateResult';

it('renders full date', async () => {
  const { container } = render(
    <DateResult {...await runCode('date(2021-01-01)')} />
  );

  expect(container.textContent).toMatchInlineSnapshot(`"Jan 1 2021"`);
});

it('renders year date', async () => {
  const { container } = render(<DateResult {...await runCode('date(2021)')} />);

  expect(container.textContent).toMatchInlineSnapshot(`"2021"`);
});

it('renders month date', async () => {
  const { container } = render(
    <DateResult {...await runCode('date(2021-01)')} />
  );

  expect(container.textContent).toMatchInlineSnapshot(`"Jan 2021"`);
});

it('renders time', async () => {
  const { container } = render(
    <DateResult {...await runCode('date(2021-01-01 00:00)')} />
  );

  expect(container.textContent).toMatchInlineSnapshot(`"Jan 1 2021 00:00 UTC"`);
});

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
