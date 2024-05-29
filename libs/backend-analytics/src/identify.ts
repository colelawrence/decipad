/* eslint-disable no-console */
import { analyticsClient } from './client';
import type { APIGatewayProxyEventV2 } from 'aws-lambda';

export interface IdentifyEvent {
  email?: string | null | undefined;
  fullName?: string | null | undefined;
}

export const identify = (
  request: APIGatewayProxyEventV2,
  userId: string,
  event: IdentifyEvent
): Promise<void> | void => {
  const client = analyticsClient(request);
  if (client) {
    return new Promise((resolve) => {
      client.identify({ userId, traits: event }, (err: Error) => {
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
