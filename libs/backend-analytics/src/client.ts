/* eslint-disable no-console */
import {
  Analytics as AnalyticsClient,
  TrackParams,
} from '@segment/analytics-node';
import { analytics } from '@decipad/backend-config';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

const { secretKey } = analytics();

type MyTrackParams = Omit<TrackParams, 'userId' | 'anonymousId'> & {
  userId?: string;
  anonymousId?: string;
};

type MyIdentify =
  | { userId: string; anonymousId?: undefined }
  | { userId?: undefined; anonymousId: string };

class MyAnalyticsClient extends AnalyticsClient {
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
    super.track(message as TrackParams, callback);
  }
}

const clientForEvent = new WeakMap<APIGatewayProxyEventV2, MyAnalyticsClient>();

export const analyticsClient = (event: APIGatewayProxyEventV2) => {
  if (!secretKey) {
    return undefined;
  }
  let client = clientForEvent.get(event);
  if (!client) {
    client = new MyAnalyticsClient({ writeKey: secretKey });
    clientForEvent.set(event, client);
  }
  return client;
};
