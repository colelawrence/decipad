import { applyCssVars, findParentWithStyle } from '@decipad/dom-test-utils';
import { render, screen } from '@testing-library/react';
import { CodeVariable } from './CodeVariable';

let cleanup: undefined | (() => void);
afterEach(() => cleanup?.());

it('renders children', () => {
  render(<CodeVariable>Foo</CodeVariable>);
  expect(screen.getByText('Foo')).toBeVisible();
});

it('styles variable when variable exists', async () => {
  render(<CodeVariable>Foo</CodeVariable>);
  cleanup = await applyCssVars();
  const normalBackgroundColor = findParentWithStyle(
    screen.getByText('Foo'),
    'backgroundColor'
  )?.backgroundColor;
  cleanup();
  expect(normalBackgroundColor).not.toEqual('');
});

it('styles missing variables', async () => {
  render(<CodeVariable variableMissing>Foo</CodeVariable>);
  cleanup = await applyCssVars();
  const normalBackgroundColor = findParentWithStyle(
    screen.getByText('Foo'),
    'backgroundColor'
  )?.backgroundColor;
  cleanup();
  expect(normalBackgroundColor).not.toEqual('');
});
