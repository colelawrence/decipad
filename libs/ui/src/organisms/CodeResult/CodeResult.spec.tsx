import { render } from '@testing-library/react';
import { runCode } from '../../test-utils';
import { CodeResult } from './CodeResult';

it('renders a number result', async () => {
  const { container } = render(
    <CodeResult {...await runCode('10')} variant="inline" />
  );
  expect(container.textContent).toContain('10');
});

it('renders a boolean result', async () => {
  const { container } = render(
    <CodeResult {...await runCode('false')} variant="inline" />
  );
  expect(container.textContent).toContain('Checkbox unselected');
});

it('renders a string result', async () => {
  const { container } = render(
    <CodeResult {...await runCode('"text"')} variant="inline" />
  );
  expect(container.textContent).toContain('text');
});

it('renders a date result', async () => {
  const { container } = render(
    <CodeResult {...await runCode('date(2021)')} variant="inline" />
  );
  expect(container.textContent).toContain('2021');
});

it('renders a range result', async () => {
  const { container } = render(
    <CodeResult {...await runCode('range(1 .. 10)')} variant="inline" />
  );
  expect(container.textContent).toContain('1');
});

it.each(['block', 'inline'] as const)(
  'renders a %s column result',
  async (variant) => {
    const { container } = render(
      <CodeResult {...await runCode('[1, 2, 3]')} variant={variant} />
    );
    expect(container.textContent).toContain('1');
  }
);

it.each(['block', 'inline'] as const)(
  'renders a %s table result',
  async (variant) => {
    const { container } = render(
      <CodeResult
        {...await runCode('table = {A = ["A"], B = [1]}')}
        variant={variant}
      />
    );
    expect(container.textContent).toMatch(/Table|A/);
  }
);
