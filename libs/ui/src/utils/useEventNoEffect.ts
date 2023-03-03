import { UIEvent, useCallback } from 'react';

export const useEventNoEffect = <T, E extends UIEvent = UIEvent>(
  cb?: () => T,
  dontPreventDefault = false
): ((ev: E) => void) => {
  return useCallback(
    (ev: UIEvent) => {
      ev.stopPropagation();
      !dontPreventDefault && ev.preventDefault();
      if (cb) {
        cb();
      }
    },
    [cb, dontPreventDefault]
  );
};
