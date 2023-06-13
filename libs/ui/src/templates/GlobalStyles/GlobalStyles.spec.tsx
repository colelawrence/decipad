import { mockConsoleWarn } from '@decipad/testutils';
import { render } from '@testing-library/react';

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

it('renders the children', () => {
  const { container } = render(<GlobalStyles>text</GlobalStyles>);
  expect(container).toHaveTextContent('text');
});

it('applies doesnt have global styles', () => {
  expect(getComputedStyle(document.body).boxSizing).not.toBe('border-box');
  render(<GlobalStyles />);
});

it('applies global styles', () => {
  expect(getComputedStyle(document.body)).toMatchInlineSnapshot(`
    CSSStyleDeclaration {
      "0": "display",
      "1": "margin",
      "2": "visibility",
      "_importants": Object {
        "display": "",
        "margin": "",
        "visibility": undefined,
      },
      "_length": 3,
      "_onChange": [Function],
      "_values": Object {
        "display": "block",
        "margin": "8px",
        "margin-bottom": "8px",
        "margin-left": "8px",
        "margin-right": "8px",
        "margin-top": "8px",
        "visibility": "visible",
      },
    }
  `);
});
