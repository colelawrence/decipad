import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { captureException } from '@decipad/backend-trace';
import { analyticsClient } from './client';

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
): Promise<void> => {
  // eslint-disable-next-line no-console
  return new Promise((resolve) => {
    const client = analyticsClient(request);
    if (client) {
      const consumeEvent = {
        ...event,
        context,
        properties: { ...event.properties, source: 'backend' },
      };
      // eslint-disable-next-line no-console
      console.log('analytics tracking', consumeEvent);
      client.track(consumeEvent, async (err: Error) => {
        // eslint-disable-next-line no-console
        console.log('analytics tracking called back');
        if (err) {
          // eslint-disable-next-line no-console
          console.error('Error tracking event', err);
          await captureException(err as Error);
        }
        // we must wait for client flush to ensure the event gets sent to provider before the request ends
        await client.flush();
        // eslint-disable-next-line no-console
        console.log('analytics tracking flushed');
        resolve();
      });
    } else {
      resolve();
    }
  });
};
