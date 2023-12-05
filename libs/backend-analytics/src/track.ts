/* eslint-disable no-console */
import { analyticsClient } from './client';
import { APIGatewayProxyEventV2 } from 'aws-lambda';

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, unknown>;
  userId?: string;
  anonymousId?: string;
}

export const track = (
  request: APIGatewayProxyEventV2,
  event: AnalyticsEvent,
  context?: Record<string, unknown>
): Promise<void> | void => {
  const client = analyticsClient(request);
  if (client) {
    const consumeEvent = {
      ...event,
      context,
      properties: { ...event.properties, source: 'backend' },
    };
    // eslint-disable-next-line no-console
    console.log('analytics tracking', consumeEvent);
    return new Promise((resolve) => {
      client.track(consumeEvent, (err) => {
        if (err) {
          console.error('Error tracking event:', err);
        } else {
          console.log('Tracked successfully');
        }
        resolve();
      });
    });
  }
};
