import { useCallback, useEffect, useState } from 'react';

export const useIsOffline = () => {
  const [isOffline, setIsOffline] = useState(false);

  const handleOfflineStatusChange = useCallback(async () => {
    if (!navigator.onLine) {
      try {
        const resp = await fetch(window.location.href);
        setIsOffline(!resp.ok);
      } catch (err) {
        setIsOffline(true);
      }
    } else {
      setIsOffline(false);
    }
  }, []);

  useEffect(() => {
    if ('addEventListener' in global) {
      global.addEventListener('online', handleOfflineStatusChange);
      global.addEventListener('offline', handleOfflineStatusChange);
    }
    return () => {
      if ('removeEventListener' in global) {
        global.removeEventListener('online', handleOfflineStatusChange);
        global.removeEventListener('offline', handleOfflineStatusChange);
      }
    };
  }, [handleOfflineStatusChange]);

  return { isOffline };
};
