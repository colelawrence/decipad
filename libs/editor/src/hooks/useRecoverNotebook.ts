import { useIsOffline } from '@decipad/editor-utils';
import { useCallback, useEffect, useState } from 'react';

const SHOW_RECOVERY_TIME = 15_000;

export function useRecoverNotebook(): [boolean, () => void] {
  const [showRecovery, setShowRecovery] = useState(false);
  const [savedTimeout, setSavedTimeout] = useState<NodeJS.Timeout | undefined>(
    undefined
  );
  const { isOffline } = useIsOffline();

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!isOffline) {
        setShowRecovery(true);
      }
    }, SHOW_RECOVERY_TIME);
    setSavedTimeout(timeout);

    return () => {
      clearInterval(timeout);
    };
  }, [isOffline]);

  const unsetTimer = useCallback(() => {
    if (savedTimeout) {
      clearTimeout(savedTimeout);
    }
  }, [savedTimeout]);

  return [showRecovery, unsetTimer];
}
