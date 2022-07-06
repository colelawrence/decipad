/* eslint-disable no-console */
import { AnalyticsBrowser } from '@segment/analytics-next';
import { useState } from 'react';

export const useAnalytics = (): AnalyticsBrowser | undefined => {
  const [analytics] = useState<AnalyticsBrowser | undefined>(() => {
    const writeKey = process.env.REACT_APP_ANALYTICS_WRITE_KEY;
    if (writeKey) {
      return AnalyticsBrowser.load({ writeKey });
    }
    return undefined;
  });
  return analytics;
};
