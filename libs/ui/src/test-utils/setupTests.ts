import '@testing-library/jest-dom/extend-expect';

import 'jest-playwright-preset';

import { matchers, createSerializer } from '@emotion/jest';
expect.extend(matchers);
expect.addSnapshotSerializer(createSerializer());


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
