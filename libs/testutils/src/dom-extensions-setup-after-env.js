/* eslint-disable import/newline-after-import */
/* eslint-disable import/first */

// DOM matchers
import '@testing-library/jest-dom/extend-expect';

// emotion
import { matchers } from '@emotion/jest';
expect.extend(matchers);

// Text{En,De}coder

import { TextEncoder, TextDecoder } from 'util';
if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
  // @ts-expect-error Node's version is a good enough polyfill
  global.TextDecoder = TextDecoder;
}

// storage event
const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function setItem(key, value) {
  originalSetItem.call(this, key, value);
  window.dispatchEvent(new StorageEvent('storage', { key }));
};
const originalRemoveItem = Storage.prototype.removeItem;
Storage.prototype.removeItem = function removeItem(key) {
  originalRemoveItem.call(this, key);
  window.dispatchEvent(new StorageEvent('storage', { key }));
};

// element scroll methods
Element.prototype.scrollIntoView = jest.fn();
Element.prototype.scrollTo = jest.fn();

// geometry
import 'geometry-polyfill';

// resizes
window.ResizeObserver = class ResizeObserver {
  constructor(cb) {
    this.cb = cb;
  }
  observe() {
    this.cb([{ borderBoxSize: { inlineSize: 0, blockSize: 0 } }]);
  }
  unobserve() {
    // Do nothing.
  }
};

window.DragEvent = class DragEvent extends MouseEvent {
  constructor(...args) {
    super(...args);
    this.dataTransfer = { getData: () => '' };
  }
};
// Since PointerEvent extends MouseEvent and we don't care about testing
// pressure and other hardware specific inputs, we can simply fake a MouseEvent
// as a PointerEvent.
window.PointerEvent = MouseEvent;

// very basic viewBox polyfill
class SVGRect {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
}
Object.defineProperty(SVGSVGElement.prototype, 'viewBox', {
  configurable: true,
  enumerable: true,
  get() {
    const rect = new SVGRect(...this.getAttribute('viewBox').split(' '));
    return { baseVal: rect, animVal: rect };
  },
});
