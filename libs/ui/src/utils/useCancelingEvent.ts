import { type SyntheticEvent, useCallback } from 'react';

export const useCancelingEvent = <T extends SyntheticEvent | UIEvent>(
  cb?: (ev: T) => unknown
) =>
  useCallback(
    (ev: T) => {
      if (cb) {
        ev.preventDefault();
        ev.stopPropagation();
        cb(ev);
      }
    },
    [cb]
  );
