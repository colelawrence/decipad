import { render } from '@testing-library/react';
import { runCode } from '../../test-utils';

import { NumberResult } from './NumberResult';

it('renders value', async () => {
  const { getByText } = render(<NumberResult {...await runCode(`10`)} />);

  expect(getByText('10')).toBeVisible();
});

it('renders negative values', async () => {
  const { container } = render(<NumberResult {...await runCode(`-10`)} />);
  expect(container.textContent).toMatchInlineSnapshot(`"-10"`);
});

it('renders formatted value', async () => {
  const { container } = render(<NumberResult {...await runCode(`10000`)} />);
  expect(container.textContent).toMatchInlineSnapshot(`"10,000"`);
});

it('renders decimal value', async () => {
  const { container } = render(<NumberResult {...await runCode(`0.1`)} />);
  expect(container.textContent).toMatchInlineSnapshot(`"0.1"`);
});

describe('units', () => {
  it('renders unit', async () => {
    const { container } = render(
      <NumberResult {...await runCode('1 banana')} />
    );
    expect(container.textContent).toMatchInlineSnapshot(`"1 banana"`);
  });

  it('renders unit pluralization', async () => {
    const { container } = render(
      <NumberResult {...await runCode('1 banana + 1 banana')} />
    );
    expect(container.textContent).toMatchInlineSnapshot(`"2 bananas"`);
  });
});
