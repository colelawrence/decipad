/* eslint-disable no-console */
import { analyticsClient } from './client';

export interface IdentifyEvent {
  email?: string | null | undefined;
  fullName?: string | null | undefined;
}

export const identify = (
  userId: string,
  event: IdentifyEvent
): Promise<void> | void => {
  const client = analyticsClient();
  if (client) {
    return new Promise((resolve) => {
      client.identify({ userId, traits: event }, (err) => {
        if (err) {
          console.error('Analytics: error identifying:', err);
        } else {
          console.log('Analytics identified successfully');
        }
        resolve();
      });
    });
  }
};
