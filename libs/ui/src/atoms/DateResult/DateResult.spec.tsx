import { render } from '@testing-library/react';
import { runCode } from '../../test-utils';
import { DateResult } from './DateResult';

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

  expect(container.textContent).toMatchInlineSnapshot(`"Jan 1 2021 00:00"`);
});
