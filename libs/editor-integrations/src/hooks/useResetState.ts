import { useConnectionStore } from '@decipad/react-contexts';
import { useEffect } from 'react';

/**
 * When you navigate to the workspace, you might `leave` the store open.
 * So we need to clean up after the user.
 */
export function useResetState() {
  const [abort] = useConnectionStore((store) => [store.abort]);

  useEffect(() => {
    abort();

    return () => {
      abort();
    };
  }, [abort]);
}
