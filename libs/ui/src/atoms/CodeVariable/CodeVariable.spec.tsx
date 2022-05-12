import { applyCssVars, findParentWithStyle } from '@decipad/dom-test-utils';
import { render } from '@testing-library/react';

import { CodeVariable } from './CodeVariable';

let cleanup: undefined | (() => void);
afterEach(() => cleanup?.());

it('renders children', () => {
  const { getByText } = render(<CodeVariable>Foo</CodeVariable>);
  expect(getByText('Foo')).toBeVisible();
});

it('styles variable when variable exists', async () => {
  const { getByText } = render(<CodeVariable>Foo</CodeVariable>);
  cleanup = await applyCssVars();
  const normalBackgroundColor = findParentWithStyle(
    getByText('Foo'),
    'backgroundColor'
  )?.backgroundColor;
  cleanup();
  expect(normalBackgroundColor).not.toEqual('');
});

it('styles missing variables', async () => {
  const { getByText } = render(
    <CodeVariable variableMissing>Foo</CodeVariable>
  );
  cleanup = await applyCssVars();
  const normalBackgroundColor = findParentWithStyle(
    getByText('Foo'),
    'backgroundColor'
  )?.backgroundColor;
  cleanup();
  expect(normalBackgroundColor).not.toEqual('');
});
