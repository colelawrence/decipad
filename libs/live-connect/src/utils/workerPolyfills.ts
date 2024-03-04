// @ts-nocheck
import { Buffer } from 'buffer';

globalThis.Buffer = Buffer;

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

globalThis.Element = {
  prototype: {
    getAttribute: () => {},
  },
};

globalThis.window = globalThis;

export {};
