import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { analyticsClient } from './client';

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
  anonymousId?: string;
}

export const track = async (
  request: APIGatewayProxyEventV2,
  event: AnalyticsEvent
): Promise<void> => {
  const client = analyticsClient(request);
  if (client) {
    const consumeEvent = {
      ...event,
      properties: { ...event.properties, source: 'backend' },
    };
    // eslint-disable-next-line no-console
    console.log('analytics tracking', consumeEvent);
    const { event: eventName, properties, userId, anonymousId } = consumeEvent;
    if (userId ?? anonymousId) {
      client.identify(userId ?? anonymousId ?? 'unknown', properties);
    }
    client.track(eventName, properties);
    // we must wait for client flush to ensure the event gets sent to provider before the request ends
    await client.flush();
    // eslint-disable-next-line no-console
    console.log('analytics tracking flushed');
  }
};
