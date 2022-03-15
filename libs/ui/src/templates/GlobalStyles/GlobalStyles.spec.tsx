import { act, render, waitFor } from '@testing-library/react';
import {
  applyPrefersColorScheme,
  findParentWithStyle,
} from '@decipad/dom-test-utils';
import { mockConsoleWarn } from '@decipad/testutils';

import { noop } from '@decipad/utils';
import { GlobalStyles } from './GlobalStyles';
import { black } from '../../primitives';

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
  await act(async () => {
    window.localStorage.setItem('deciAllowDarkTheme', 'true');
    await waitFor(() =>
      expect(document.head.innerHTML).toContain('prefers-color-scheme')
    );
  });

  cleanup = await applyPrefersColorScheme('dark');
  expect(
    findParentWithStyle(container, 'backgroundColor')?.backgroundColor
  ).toBe(black.rgb);
});
it('does not apply the dark theme when not preferred by the user agent', async () => {
  window.localStorage.setItem('deciAllowDarkTheme', 'true');
  const { container } = render(<GlobalStyles />);

  cleanup = await applyPrefersColorScheme('light');
  expect(
    findParentWithStyle(container, 'backgroundColor')?.backgroundColor
  ).not.toBe(black.rgb);
});
it('does not apply the dark theme when not enabled manually', async () => {
  window.localStorage.setItem('deciAllowDarkTheme', 'false');
  const { container } = render(<GlobalStyles />);

  cleanup = await applyPrefersColorScheme('dark');
  expect(
    findParentWithStyle(container, 'backgroundColor')?.backgroundColor
  ).not.toBe(black.rgb);
});
