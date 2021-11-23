import { render } from '@testing-library/react';
import { runCode } from '@decipad/language';

import { NumberResult } from './NumberResult';

it('renders value', async () => {
  const { getByText } = render(<NumberResult {...await runCode(`10`)} />);

  expect(getByText('10')).toBeVisible();
});

it('renders negative values', async () => {
  const { container } = render(<NumberResult {...await runCode(`-10`)} />);
  expect(container.textContent).toBe('-10');
});

it('renders formatted value', async () => {
  const { container } = render(<NumberResult {...await runCode(`10000`)} />);
  expect(container.textContent).toBe('10,000');
});

it('renders decimal value', async () => {
  const { container } = render(<NumberResult {...await runCode(`0.1`)} />);
  expect(container.textContent).toBe('0.1');
});

it('renders unit', async () => {
  const { container } = render(
    <NumberResult {...await runCode('10 bananas')} />
  );
  expect(container.textContent).toBe('10 bananas');
});
