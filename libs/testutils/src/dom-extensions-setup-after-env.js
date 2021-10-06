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
