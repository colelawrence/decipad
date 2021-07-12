import { act, render } from '@testing-library/react';

import { black } from '../../primitives';
import {
  applyPrefersColorScheme,
  findParentWithStyle,
  mockConsoleWarn,
} from '../../test-utils';
import { noop } from '../../utils';
import { GlobalStyles } from './GlobalStyles';

mockConsoleWarn();

afterEach(() => {
  window.localStorage.clear();
});

let cleanup!: () => void;
beforeEach(() => {
  cleanup = noop;
});
afterEach(() => {
  cleanup();
});

it('renders the children', async () => {
  const { container } = render(<GlobalStyles>text</GlobalStyles>);
  expect(container).toHaveTextContent('text');
});

it('applies global styles', async () => {
  expect(getComputedStyle(document.body).boxSizing).not.toBe('border-box');
  render(<GlobalStyles />);
  expect(getComputedStyle(document.body).boxSizing).toBe('border-box');
});

it('applies the dark theme when enabled manually and preferred by the user agent', async () => {
  window.localStorage.setItem('deciAllowDarkTheme', 'true');
  const { container } = render(<GlobalStyles />);

  cleanup = await applyPrefersColorScheme('dark');
  expect(
    findParentWithStyle(container, 'backgroundColor')?.backgroundColor
  ).toBe(black.rgb);
});
it('applies the dark theme when preferred by the user agent *once* enabled manually', async () => {
  const { container } = render(<GlobalStyles />);
  window.localStorage.setItem('deciAllowDarkTheme', 'true');
  act(() => {
    window.dispatchEvent(new StorageEvent('storage'));
  });

  cleanup = await applyPrefersColorScheme('dark');
  expect(
    findParentWithStyle(container, 'backgroundColor')?.backgroundColor
  ).toBe(black.rgb);
});
it('does not apply the dark theme when not preferred by the user agent', async () => {
  const { container } = render(<GlobalStyles />);
  window.localStorage.setItem('deciAllowDarkTheme', 'true');

  cleanup = await applyPrefersColorScheme('light');
  expect(
    findParentWithStyle(container, 'backgroundColor')?.backgroundColor
  ).not.toBe(black.rgb);
});
it('does not apply the dark theme when not enabled manually', async () => {
  const { container } = render(<GlobalStyles />);
  window.localStorage.setItem('deciAllowDarkTheme', 'false');

  cleanup = await applyPrefersColorScheme('dark');
  expect(
    findParentWithStyle(container, 'backgroundColor')?.backgroundColor
  ).not.toBe(black.rgb);
});
