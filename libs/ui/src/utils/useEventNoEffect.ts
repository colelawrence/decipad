import { UIEvent, useCallback } from 'react';

export const useEventNoEffect = <T, E extends UIEvent = UIEvent>(
  cb?: () => T
): ((ev: E) => void) => {
  return useCallback(
    (ev: UIEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      if (cb) {
        cb();
      }
    },
    [cb]
  );
};
