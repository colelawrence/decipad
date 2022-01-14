import { useState, useEffect } from 'react';
import { Analytics } from '@segment/analytics-next';
import { loadAnalytics } from './analytics';

export function useAnalytics(): Analytics | void {
  const [analytics, setAnalytics] = useState<Analytics | void>();

  useEffect(() => {
    (async () => {
      setAnalytics(await loadAnalytics());
    })();
  }, []);

  return analytics;
}
