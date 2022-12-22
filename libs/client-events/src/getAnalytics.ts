/* eslint-disable no-console */
import { AnalyticsBrowser } from '@segment/analytics-next';

let globalAnalytics: AnalyticsBrowser | undefined;

export const getAnalytics = (): AnalyticsBrowser | undefined => {
  if (globalAnalytics) {
    return globalAnalytics;
  }
  const writeKey = process.env.REACT_APP_ANALYTICS_WRITE_KEY;
  if (writeKey) {
    globalAnalytics = AnalyticsBrowser.load({ writeKey });
  }
  return globalAnalytics;
};
