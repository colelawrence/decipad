// DOM matchers
import '@testing-library/jest-dom/extend-expect';

// emotion
import { matchers } from '@emotion/jest';

import { TextEncoder, TextDecoder } from 'util';

expect.extend(matchers);

if (!global.TextEncoder) {
  global.TextEncoder = TextEncoder;
  // @ts-expect-error Node's version is a good enough polyfill
  global.TextDecoder = TextDecoder;
}

// storage event polyfill
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

// element scroll methods polyfill
Element.prototype.scrollIntoView = jest.fn();
Element.prototype.scrollTo = jest.fn();

// `ResizeObserver` and `DOMRect` and `PointerEvent` for dropdown menus to work.
// See https://github.com/radix-ui/primitives/issues/420#issuecomment-771615182
// and https://github.com/radix-ui/primitives/blob/cefcb6d9281cf203b0ab54b49f85725dc203df85/packages/react/dropdown-menu/src/DropdownMenu.tsx#L169-L178
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

window.DOMRect = {
  fromRect: () => ({
    x: 0,
    y: 0,
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    width: 0,
    height: 0,
  }),
};

// Since PointerEvent extends MouseEvent and we don't care about testing
// pressure and other hardware specific inputs, we can simply fake a MouseEvent
// as a PointerEvent.
window.PointerEvent = MouseEvent;
