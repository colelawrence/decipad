/* eslint-disable no-console */
import { env } from '@decipad/utils';
import { AnalyticsBrowser } from '@segment/analytics-next';
import { isServerSideRendering } from '@decipad/support';
import { getSession } from 'next-auth/react';

let globalAnalytics: AnalyticsBrowser;

const isTesting = !!process.env.JEST_WORKER_ID;

export const getAnalytics = async (): Promise<AnalyticsBrowser> => {
  if (isTesting) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return { track: () => {} } as any;
  }
  if (globalAnalytics) {
    return globalAnalytics;
  }
  if (isServerSideRendering()) {
    throw new Error('Cannot get analytics on the server');
  }
  const loggedIn = (await getSession()) !== null;
  if (!loggedIn) {
    throw new Error('Cannot get analytics for logged out user');
  }
  const writeKey = env.VITE_ANALYTICS_WRITE_KEY;
  if (writeKey) {
    try {
      globalAnalytics = AnalyticsBrowser.load({ writeKey });
    } catch (err) {
      throw new Error('Error loading analytics');
    }
  }

  return globalAnalytics;
};
