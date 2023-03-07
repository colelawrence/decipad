// @ts-nocheck
// worker poolyfill shenanigans
global.document = {
  documentElement: {
    currentStyle: 'fake',
  },
  getElementsByTagName() {
    return [];
  },
  addEventListener() {},
};
global.window = {
  navigator: {
    platform: 'fake',
  },
  addEventListener: () => undefined,
};
global.Element = {
  prototype: {
    matches: () => false,
  },
};
global.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.cancelAnimationFrame = (timer) => clearTimeout(timer);

global.window = global;

export {};
