/* eslint-disable no-console */
import { env } from '@decipad/client-env';
import type { Analytics } from '@segment/analytics-next';
import { AnalyticsBrowser } from '@segment/analytics-next';
import { isServerSideRendering } from '@decipad/support';
import { getSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import * as Sentry from '@sentry/react';

let globalAnalytics: Analytics | undefined;

const isTesting = !!(
  process.env.JEST_WORKER_ID ?? process.env.VITEST_WORKER_ID
);

export const getAnalytics = async (): Promise<Analytics | undefined> => {
  if (isTesting) {
    return undefined;
  }
  if (globalAnalytics) {
    return globalAnalytics;
  }
  if (isServerSideRendering()) {
    return undefined;
  }
  const session = await getSession();
  if (!session || !session.user) {
    console.log('NOT LOGGED IN');
    return undefined;
  }
  const writeKey = env.VITE_ANALYTICS_WRITE_KEY;
  if (writeKey) {
    try {
      globalAnalytics = (await AnalyticsBrowser.load({ writeKey }))?.[0];
      const userId = (session.user as { id: string }).id;
      console.debug('analytics: identifying user with id', userId);
      globalAnalytics.identify(userId, {
        email: session.user.email,
      });
      Sentry.setUser({
        id: userId,
        email: session.user.email ?? undefined,
      });
    } catch (err) {
      console.error('Error loading analytics', err);
      throw new Error('Error loading analytics');
    }
  }

  return globalAnalytics;
};

export const useGAPageTracking = () => {
  const location = useLocation();

  useEffect(() => {
    (async () => {
      if (!isTesting && env.VITE_GOOGLE_ANALYTICS_ID) {
        const ReactGA = await import('react-ga');
        ReactGA.initialize(env.VITE_GOOGLE_ANALYTICS_ID);
        ReactGA.pageview(window.location.pathname + window.location.search);
      }
    })();
  }, [location]);
};
