// DOM matchers
import '@testing-library/jest-dom/extend-expect';

// playwright globals for browser tests
import 'jest-playwright-preset';

// emotion
import { matchers, createSerializer } from '@emotion/jest';
expect.extend(matchers);
expect.addSnapshotSerializer(createSerializer()); // TODO remove once no element snapshots left

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
