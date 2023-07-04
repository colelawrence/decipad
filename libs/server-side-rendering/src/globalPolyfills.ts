/* eslint-disable import/no-extraneous-dependencies */
import 'cross-fetch/polyfill';

// resizes
interface ResizeObserverValue {
  borderBoxSize: { inlineSize: number; blockSize: number };
}

type ResizeObserverCallback = (res: ResizeObserverValue[]) => unknown;

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
global.ResizeObserver = class ResizeObserver {
  public cb: ResizeObserverCallback;
  constructor(cb: ResizeObserverCallback) {
    this.cb = cb;
  }
  observe() {
    this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }]);
  }
  unobserve() {
    // Do nothing.
  }
  disconnect() {
    // do nothing
  }
};
