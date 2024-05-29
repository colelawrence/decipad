/* eslint-disable no-console */
import type { CoreAnalytics } from '@segment/analytics-core';
import EventEmitter from 'events';

// Analytics client for development environment
export class DevAnalyticsClient extends EventEmitter implements CoreAnalytics {
  track(event: object, callback?: () => unknown) {
    console.debug('DevAnalyticsClient: tracking', event);
    if (callback) {
      setTimeout(callback, 0);
    }
    return Promise.resolve();
  }
  page(event: object, callback?: () => unknown) {
    console.debug('DevAnalyticsClient: page', event);
    if (callback) {
      setTimeout(callback, 0);
    }
    return Promise.resolve();
  }
  identify(arg: object, callback?: () => unknown) {
    console.debug('DevAnalyticsClient: identify', arg);
    if (callback) {
      setTimeout(callback, 0);
    }
    return Promise.resolve();
  }
  group(arg: object, callback?: () => unknown) {
    console.debug('DevAnalyticsClient: group', arg);
    if (callback) {
      setTimeout(callback, 0);
    }
    return Promise.resolve();
  }
  alias(arg: object, callback?: () => unknown) {
    console.debug('DevAnalyticsClient: alias', arg);
    if (callback) {
      setTimeout(callback, 0);
    }
    return Promise.resolve();
  }
  screen(arg: object, callback?: () => unknown) {
    console.debug('DevAnalyticsClient: screen', arg);
    if (callback) {
      setTimeout(callback, 0);
    }
    return Promise.resolve();
  }
  register(...plugins: unknown[]) {
    console.debug('DevAnalyticsClient: register', plugins);
    return Promise.resolve();
  }
  deregister(...plugins: unknown[]) {
    console.debug('DevAnalyticsClient: deregister', plugins);
    return Promise.resolve();
  }
  closeAndFlush() {
    return Promise.resolve();
  }
  flush() {
    return Promise.resolve();
  }
  VERSION = '1.0.0';
}
