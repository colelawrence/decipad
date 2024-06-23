// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// globalThis.Buffer = Buffer;

const isTesting = !!process.env.VITEST;

if (!isTesting) {
  // eslint-disable-next-line no-console
  console.log('setting up worker polyfills (2)');
  globalThis.process = {
    ...globalThis.process,
    on: () => {},
  };

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

  // globalThis.Element = {
  //   prototype: {
  //     getAttribute: () => {},
  //   },
  // };

  globalThis.window = globalThis;
}

export {};
