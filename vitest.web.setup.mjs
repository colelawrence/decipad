import { cleanup } from '@testing-library/react';
import { vi, afterEach, afterAll, beforeAll, expect } from 'vitest';
import '@testing-library/jest-dom/vitest';

const consoleError = console.error;
let mockConsoleError;

beforeAll(() => {
  mockConsoleError = vi
    .spyOn(console, 'error')
    .mockImplementation((...args) => {
      const message = typeof args[0] === 'string' ? args[0] : '';
      if (
        message.includes(
          'When testing, code that causes React state updates should be wrapped into act(...)'
        ) ||
        message.includes('antd') ||
        message.includes(
          'Warning: A component is `contentEditable` and contains `children` managed by React.'
        )
      ) {
        return;
      }

      return consoleError.call(console, ...args);
    });
});

afterAll(() => {
  mockConsoleError.mockRestore();
});

afterEach(cleanup);

expect.extend({
  toHaveChildrenText(received, expectedTexts) {
    if (expectedTexts.length !== received.length) {
      return {
        message: () =>
          `expected received array to have length ${expectedTexts.length}, but got ${received.length}`,
        pass: false,
      };
    }

    for (let i = 0; i < received.length; i++) {
      const element = received[i];
      if (
        !element.children ||
        !Array.isArray(element.children) ||
        element.children[0].text !== expectedTexts[i]
      ) {
        return {
          message: () =>
            `expected element at index ${i} to have text '${
              expectedTexts[i]
            }', but got '${
              element.children ? element.children[0].text : 'undefined'
            }'`,
          pass: false,
        };
      }
    }

    return {
      message: () => 'all elements have the expected children text',
      pass: true,
    };
  },
});

globalThis.IS_REACT_ACT_ENVIRONMENT = true;
