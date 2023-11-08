/* eslint-disable no-console */
import { AnalyticsBrowser } from '@segment/analytics-next';
import { isServerSideRendering } from '@decipad/support';

let globalAnalytics: AnalyticsBrowser | undefined;

export const getAnalytics = (): AnalyticsBrowser | undefined => {
  if (globalAnalytics) {
    return globalAnalytics;
  }
  if (isServerSideRendering()) {
    return undefined;
  }
  const writeKey = process.env.REACT_APP_ANALYTICS_WRITE_KEY;
  if (writeKey) {
    try {
      globalAnalytics = AnalyticsBrowser.load({ writeKey });
    } catch (err) {
      console.error('Error loading analytics', err);
    }
  }
  return globalAnalytics;
};
