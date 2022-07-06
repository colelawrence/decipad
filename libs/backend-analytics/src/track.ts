/* eslint-disable no-console */
import { nanoid } from 'nanoid';
import { analyticsClient } from './client';

export interface AnalyticsEvent {
  event: string;
  userId?: string;
  properties?: Record<string, string | boolean | undefined | null>;
}

export const track = (
  event: AnalyticsEvent,
  context?: unknown
): Promise<void> | void => {
  const client = analyticsClient();
  if (client) {
    const consumeEvent = {
      ...event,
      anonymousId: event.userId ? undefined : nanoid(),
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
