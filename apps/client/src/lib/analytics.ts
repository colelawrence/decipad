import { Analytics, AnalyticsBrowser } from '@segment/analytics-next';

const writeKey = process.env.NEXT_PUBLIC_ANALYTICS_WRITE_KEY;

let analytics: Analytics | undefined;

export const loadAnalytics = async (): Promise<Analytics | void> => {
  if (!writeKey) {
    return;
  }
  if (analytics) {
    return analytics;
  }
  const [response] = await AnalyticsBrowser.load({ writeKey });
  analytics = response;
  return response;
};
