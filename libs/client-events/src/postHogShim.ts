/* eslint-disable @typescript-eslint/no-explicit-any */
import { type PostHog } from 'posthog-js';
import { AnalyticsProviderApi } from './types';

export const postHogShim = (
  posthog: PostHog | undefined
): AnalyticsProviderApi => {
  return {
    identify: (userId, traits) => {
      posthog?.reset();
      posthog?.identify(userId, traits);
    },
    // Typescript being mega stupid here?
    track: (event) =>
      posthog?.capture((event as any).action, (event as any).props),
    page: () => posthog?.capture('$pageview'),
  };
};
