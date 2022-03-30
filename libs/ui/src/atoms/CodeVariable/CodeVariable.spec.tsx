import { render } from '@testing-library/react';

import { CodeVariable } from './CodeVariable';

it('renders children', () => {
  const { getByText } = render(<CodeVariable>Foo</CodeVariable>);
  expect(getByText('Foo')).toBeVisible();
});

it('styles variable when variable exists', () => {
  const { getByText } = render(<CodeVariable>Foo</CodeVariable>);
  expect(getComputedStyle(getByText('Foo')).backgroundColor).not.toEqual('');
});

it('does not style missing variables', () => {
  const { getByText } = render(
    <CodeVariable variableMissing>Foo</CodeVariable>
  );
  expect(getComputedStyle(getByText('Foo')).backgroundColor).toEqual('');
});
