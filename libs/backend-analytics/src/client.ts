/* eslint-disable no-console */
import { PostHogOptions, PostHog } from 'posthog-node';
import { analytics } from '@decipad/backend-config';
import type { APIGatewayProxyEventV2, ScheduledEvent } from 'aws-lambda';
import { DevAnalyticsClient } from './DevAnalyticsClient';
import EventEmitter from 'node:events';

const { posthogApiKey } = analytics();

export type TMyAnalyticsClient = EventEmitter & {
  identify: (
    userId: string,
    params: Record<string | number, unknown>
  ) => unknown;
  recordProperty: (key: string, value: string) => unknown;
  page: (url: string) => unknown;
  track: (event: string, properties: Record<string, unknown>) => unknown;
  closeAndFlush: (timeout?: number) => Promise<unknown>;
  flush: () => Promise<unknown>;
};
const createAnalyticsClient = (client?: PostHog): TMyAnalyticsClient => {
  if (!client) {
    return new DevAnalyticsClient();
  }
  class MyAnalyticsClient extends EventEmitter implements TMyAnalyticsClient {
    private readonly client: PostHog;
    private userId: string | undefined;
    private properties: Record<string, unknown> = {};

    constructor(c: PostHog) {
      super();
      this.client = c;
    }

    page(url: string) {
      return this.client.capture({
        distinctId: this.userId ?? 'unknown',
        event: '$pageview',
        properties: { $current_url: url, ...this.properties },
      });
    }

    track(event: string, properties: Record<string, unknown>) {
      return this.client.capture({
        distinctId: this.userId ?? 'unknown',
        event,
        properties: { ...this.properties, ...properties },
      });
    }

    identify(userId: string, params: Record<string, unknown>) {
      this.userId = userId;
      return this.client.identify({ distinctId: userId, properties: params });
    }

    recordProperty(key: string, value: string) {
      this.properties[key] = value;
    }

    async closeAndFlush(timeout?: number) {
      await this.flush();
      await this.client.shutdown(timeout);
    }

    async flush() {
      await this.client.flush();
    }
  }

  return new MyAnalyticsClient(client);
};

const clientForEvent = new WeakMap<
  APIGatewayProxyEventV2 | ScheduledEvent,
  TMyAnalyticsClient
>();

const analyticsSettings = (): PostHogOptions => ({
  flushAt: 1,
  flushInterval: 1,
  host: 'https://eu.i.posthog.com',
});

export const analyticsClient = (
  event: APIGatewayProxyEventV2 | ScheduledEvent
) => {
  let client = clientForEvent.get(event);
  if (!client) {
    let posthog: PostHog | undefined;
    if (posthogApiKey) {
      console.log('hae posthogApiKey', posthogApiKey);
      posthog = new PostHog(posthogApiKey, analyticsSettings());
    }
    client = createAnalyticsClient(posthog);
    if (event && typeof event === 'object') {
      clientForEvent.set(event, client);
      client.once('deregister', () => clientForEvent.delete(event));
    }
  }
  return client;
};
