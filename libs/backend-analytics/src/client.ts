/* eslint-disable no-console */
import type {
  AnalyticsSettings,
  IdentifyParams,
  TrackParams,
} from '@segment/analytics-node';
import { Analytics as AnalyticsClient } from '@segment/analytics-node';
import type { CoreAnalytics } from '@segment/analytics-core';
import { analytics } from '@decipad/backend-config';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import type { Callback } from '@segment/analytics-node/dist/types/app/dispatch-emit';
import { DevAnalyticsClient } from './DevAnalyticsClient';

const { secretKey } = analytics();

type MyTrackParams = Omit<TrackParams, 'userId' | 'anonymousId'> & {
  userId?: string;
  anonymousId?: string;
};

type MyIdentify =
  | { userId: string; anonymousId?: undefined }
  | { userId?: undefined; anonymousId: string };

interface CloseAndFlushOptions {
  timeout?: number;
}

interface TMyAnalyticsClient
  extends Pick<CoreAnalytics, 'identify' | 'page' | 'track'> {
  recordProperty(key: string, value: string): void;
  myIdentify(identify: MyIdentify): void;
  flush: () => Promise<void>;
  closeAndFlush: (options: CloseAndFlushOptions) => Promise<void>;
}

const createAnalyticsClient = (settings: AnalyticsSettings) => {
  const Base = settings.writeKey ? AnalyticsClient : DevAnalyticsClient;

  class MyAnalyticsClient extends Base implements TMyAnalyticsClient {
    page(...args: unknown[]) {
      return super.page(...args);
    }
    private myRecordedProperties: Record<string, string> = {};

    public recordProperty(key: string, value: string) {
      this.myRecordedProperties[key] = value;
    }

    private myRecordedIdentify: MyIdentify = { anonymousId: 'unknown' };

    public myIdentify(identify: MyIdentify) {
      this.myRecordedIdentify = identify;
    }

    track(message: MyTrackParams, callback?: (err?: unknown) => unknown) {
      if (!message.properties) {
        // eslint-disable-next-line no-param-reassign
        message.properties = {};
      }
      Object.assign(message, this.myRecordedIdentify);
      Object.assign(message.properties, this.myRecordedProperties);

      console.debug('MyAnalyticsClient: tracking', message);

      super.track(message as TrackParams, callback);
    }

    identify(params: IdentifyParams, callback?: Callback | undefined): void {
      if (!params.traits) {
        // eslint-disable-next-line no-param-reassign
        params.traits = {};
      }
      Object.assign(params.traits, this.myRecordedProperties);
      return super.identify(params, callback);
    }
    closeAndFlush(options?: CloseAndFlushOptions) {
      return super.closeAndFlush(options);
    }
    flush() {
      return super.flush();
    }
  }

  return new MyAnalyticsClient(settings);
};

const clientForEvent = new WeakMap<
  APIGatewayProxyEventV2,
  TMyAnalyticsClient
>();

const analyticsSettings = (): AnalyticsSettings => ({
  writeKey: secretKey,
  maxEventsInBatch: 1,
  maxRetries: 1,
});

export const analyticsClient = (event: APIGatewayProxyEventV2) => {
  let client = clientForEvent.get(event);
  if (!client) {
    const settings = analyticsSettings();
    console.log('using analytics settings', settings);
    client = createAnalyticsClient(settings);
    if (event && typeof event === 'object') {
      clientForEvent.set(event, client);
      if (client instanceof AnalyticsClient) {
        client.once('deregister', () => clientForEvent.delete(event));
      }
    }
  }
  return client;
};
