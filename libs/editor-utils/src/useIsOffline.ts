import { useCallback, useEffect, useState } from 'react';

export const useIsOffline = () => {
  const [isOffline, setIsOffline] = useState(false);

  const handleOfflineStatusChange = useCallback(async () => {
    if (!navigator.onLine) {
      const resp = await fetch(window.location.href);
      setIsOffline(!resp.ok);
    } else {
      setIsOffline(false);
    }
  }, []);

  useEffect(() => {
    global.addEventListener('online', handleOfflineStatusChange);
    global.addEventListener('offline', handleOfflineStatusChange);

    return () => {
      global.removeEventListener('online', handleOfflineStatusChange);
      global.removeEventListener('offline', handleOfflineStatusChange);
    };
  }, [handleOfflineStatusChange]);

  return { isOffline };
};
