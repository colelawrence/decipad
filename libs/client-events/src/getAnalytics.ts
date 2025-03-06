/* eslint-disable no-console */
import { env } from '@decipad/client-env';
import PostHog from 'posthog-js';
import { isServerSideRendering } from '@decipad/support';
import { getSession } from 'next-auth/react';
import * as Sentry from '@sentry/react';
import { AnalyticsProviderApi } from './types';
import { postHogShim } from './postHogShim';
import { noop } from '@decipad/utils';
import { Session } from 'next-auth';

const isTesting = !!(
  process.env.JEST_WORKER_ID ?? process.env.VITEST_WORKER_ID
);

const createAnalyticsQueue = (): [
  AnalyticsProviderApi,
  (provider: AnalyticsProviderApi) => void
] => {
  const pageQueue: Array<Parameters<AnalyticsProviderApi['page']>> = [];
  const trackQueue: Array<Parameters<AnalyticsProviderApi['track']>> = [];
  const identifyQueue: Array<Parameters<AnalyticsProviderApi['identify']>> = [];

  return [
    {
      page(...params) {
        pageQueue.push(params);
      },
      track(...params) {
        trackQueue.push(params);
      },
      identify(...params) {
        identifyQueue.push(params);
      },
    },
    (provider) => {
      pageQueue.forEach((a) => provider.page(...a));
      trackQueue.forEach((a) => provider.track(...a));
      identifyQueue.forEach((a) => provider.identify(...a));
    },
  ];
};

const voidAnalyticsProvider: AnalyticsProviderApi = {
  page: noop,
  track: noop,
  identify: noop,
};

let _analytics = voidAnalyticsProvider;
export const analytics = _analytics;

export const initializeGlobalAnalytics = async (
  sessionGetter: () => Promise<Session | null>,
  getAnalyticsProvider: () => AnalyticsProviderApi
) => {
  const [provider, onLoad] = createAnalyticsQueue();

  if (isTesting || isServerSideRendering() || env.DEV) {
    return;
  }

  _analytics = provider;

  const session = await sessionGetter();
  if (!session || !session.user) {
    console.log('NOT LOGGED IN');
    return;
  }

  const userId = (session.user as { id: string }).id;

  Sentry.setUser({
    id: userId,
    email: session.user.email ?? undefined,
  });

  const posthogWriteKey = env.VITE_POSTHOG_API_KEY;
  if (posthogWriteKey == null) {
    return;
  }

  _analytics = getAnalyticsProvider();

  onLoad(_analytics);
};

initializeGlobalAnalytics(getSession, () => {
  const posthogWriteKey = env.VITE_POSTHOG_API_KEY;
  if (posthogWriteKey == null) {
    return voidAnalyticsProvider;
  }

  return postHogShim(
    PostHog.init(posthogWriteKey, {
      api_host: 'https://eu.i.posthog.com',
      person_profiles: 'identified_only', // or 'always' to create profiles for anonymous users as well
      enable_recording_console_log: true,
    })
  );
});
