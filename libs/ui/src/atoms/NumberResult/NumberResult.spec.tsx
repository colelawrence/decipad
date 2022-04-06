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

it('renders zero', async () => {
  const { container } = render(<NumberResult {...await runCode(`0`)} />);
  expect(container.textContent).toMatchInlineSnapshot(`"0"`);
});

it('renders 0.0', async () => {
  const { container } = render(<NumberResult {...await runCode(`0.0`)} />);
  expect(container.textContent).toMatchInlineSnapshot(`"0"`);
});

it('renders decimal value', async () => {
  const { container } = render(<NumberResult {...await runCode(`0.1`)} />);
  expect(container.textContent).toMatchInlineSnapshot(`"0.1"`);
});

it('renders super small decimal value', async () => {
  const { container } = render(<NumberResult {...await runCode(`10^-20`)} />);
  expect(container.textContent).toMatchInlineSnapshot(
    `"0.00000000000000000001"`
  );
});

it('renders super super small decimal value', async () => {
  const { container } = render(<NumberResult {...await runCode(`10^-101`)} />);
  expect(container.textContent).toMatchInlineSnapshot(
    `"0.00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001"`
  );
});

it('rounds fraction', async () => {
  const { container } = render(
    <NumberResult {...await runCode(`1/27932716234532345672234567`)} />
  );
  expect(container.textContent).toMatchInlineSnapshot(
    `"0.00000000000000000000000003580031357(...)"`
  );
});

it('renders huge number', async () => {
  const { container } = render(<NumberResult {...await runCode(`10^101`)} />);
  expect(container.textContent).toMatchInlineSnapshot(
    `"100,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000,000"`
  );
});

it('renders repetitive decimal', async () => {
  const { container } = render(<NumberResult {...await runCode(`1/3`)} />);
  expect(container.textContent).toMatchInlineSnapshot(`"0.(3)"`);
});

it('shows approximation of long decimal', async () => {
  const { container } = render(
    <NumberResult {...await runCode(`5.81 / 41248.20`)} />
  );
  expect(container.textContent).toMatchInlineSnapshot(`"0.00014(...)"`);
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
