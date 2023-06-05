/* istanbul ignore next */
import { useCallback, useEffect } from 'react';

export const useEnterListener = (callback: () => void) => {
  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        callback();
      }
    },
    [callback]
  );

  useEffect(() => {
    document.addEventListener('keypress', handleKeyPress);

    return () => {
      document.removeEventListener('keypress', handleKeyPress);
    };
  }, [handleKeyPress]);
};
