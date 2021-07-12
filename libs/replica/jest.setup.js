import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import { WebSocket } from 'mock-socket';

enableFetchMocks();
fetchMock.dontMock();

window.WebSocket = WebSocket;

const originalSetItem = Storage.prototype.setItem;
Storage.prototype.setItem = function setItem(key, value) {
  originalSetItem.call(this, key, value);
  window.dispatchEvent(new StorageEvent('storage', { key }));
};
const originalRemoveItem = Storage.prototype.setItem;
Storage.prototype.removeItem = function removeItem(key) {
  originalRemoveItem.call(this, key);
  window.dispatchEvent(new StorageEvent('storage', { key }));
};
