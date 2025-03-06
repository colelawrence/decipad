/* eslint-disable no-console */
import { noop } from '@decipad/utils';
import { TMyAnalyticsClient } from './client';
import EventEmitter from 'node:events';

const isTesting = !!(
  process.env.JEST_WORKER_ID ??
  process.env.VITEST_WORKER_ID ??
  process.env.VITEST
);
const log = isTesting ? noop : console.debug.bind(console);

// Analytics client for development environment
export class DevAnalyticsClient
  extends EventEmitter
  implements TMyAnalyticsClient
{
  page(url: string) {
    // do nothing
    log('Backend Analytics [dev]: page', url);
  }
  identify(userId: string, params: Record<string, unknown>) {
    // do nothing
    log('Backend Analytics [dev]: identify', userId, params);
  }
  track(event: string, properties: Record<string, unknown>) {
    // do nothing
    log('Backend Analytics [dev]: track', event, properties);
  }
  recordProperty(key: string, value: string) {
    // do nothing
    log('Backend Analytics [dev]: recordProperty', key, value);
  }
  closeAndFlush() {
    this.emit('deregister');
    return Promise.resolve();
  }
  flush() {
    return Promise.resolve([]);
  }
  VERSION = '1.0.0';
}
