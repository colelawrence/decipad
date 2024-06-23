/* eslint-disable no-console */
import type { CoreAnalytics } from '@segment/analytics-core';
import EventEmitter from 'events';
import { noop } from '@decipad/utils';

const isTesting = !!(
  process.env.JEST_WORKER_ID ??
  process.env.VITEST_WORKER_ID ??
  process.env.VITEST
);
const log = isTesting ? noop : console.debug.bind(console);

// Analytics client for development environment
export class DevAnalyticsClient extends EventEmitter implements CoreAnalytics {
  track(event: object, callback?: () => unknown) {
    log('DevAnalyticsClient: tracking', event);
    if (callback) {
      setTimeout(callback, 0);
    }
    return Promise.resolve();
  }
  page(event: object, callback?: () => unknown) {
    log('DevAnalyticsClient: page', event);
    if (callback) {
      setTimeout(callback, 0);
    }
    return Promise.resolve();
  }
  identify(arg: object, callback?: () => unknown) {
    log('DevAnalyticsClient: identify', arg);
    if (callback) {
      setTimeout(callback, 0);
    }
    return Promise.resolve();
  }
  group(arg: object, callback?: () => unknown) {
    log('DevAnalyticsClient: group', arg);
    if (callback) {
      setTimeout(callback, 0);
    }
    return Promise.resolve();
  }
  alias(arg: object, callback?: () => unknown) {
    log('DevAnalyticsClient: alias', arg);
    if (callback) {
      setTimeout(callback, 0);
    }
    return Promise.resolve();
  }
  screen(arg: object, callback?: () => unknown) {
    log('DevAnalyticsClient: screen', arg);
    if (callback) {
      setTimeout(callback, 0);
    }
    return Promise.resolve();
  }
  register(...plugins: unknown[]) {
    log('DevAnalyticsClient: register', plugins);
    return Promise.resolve();
  }
  deregister(...plugins: unknown[]) {
    log('DevAnalyticsClient: deregister', plugins);
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
