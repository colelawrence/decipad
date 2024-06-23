// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { Buffer } from 'buffer';

const isTesting =
  'process' in globalThis && process.env.VITEST_WORKER_ID != null;

if (!isTesting) {
  // eslint-disable-next-line no-console
  console.log('setting up worker polyfills (1)');
  if (typeof globalThis.Buffer === 'undefined') {
    globalThis.Buffer = Buffer;
  }

  if (typeof globalThis.process === 'undefined') {
    globalThis.process = {
      ...globalThis.process,
      on: () => {},
      env: {},
    };
  }

  if (typeof globalThis.document === 'undefined') {
    globalThis.document = {
      ...globalThis.document,
      createElement: () => ({
        setAttribute: () => {},
        style: {},
        querySelectorAll: () => [],
      }),
      querySelectorAll: () => [],
      addEventListener: () => {},
      getElementsByTagName: () => [],
    };
  }

  if (typeof globalThis.Element === 'undefined') {
    globalThis.Element = class Element {
      getAttribute() {}
      append() {}
    };
  }

  globalThis.window = globalThis;
}

export {};
