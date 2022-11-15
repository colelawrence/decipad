import { MouseEvent, useCallback } from 'react';

type Callback<T> = () => T;

type ReturnType = (ev: MouseEvent) => void;

export const useMouseEventNoEffect = <T>(cb?: Callback<T>): ReturnType => {
  return useCallback(
    (ev: MouseEvent) => {
      ev.stopPropagation();
      ev.preventDefault();
      if (cb) {
        cb();
      }
    },
    [cb]
  );
};
