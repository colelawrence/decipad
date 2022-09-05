import { render } from '@testing-library/react';
import { mockConsoleWarn } from '@decipad/testutils';

import { noop } from '@decipad/utils';
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
