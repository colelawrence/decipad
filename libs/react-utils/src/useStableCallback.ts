import { useCallback, useRef } from 'react';

/**
 * Create a 'stable' version of a callback that will always use the most recent
 * version when called. Stable callbacks have no effect on dependency lists and
 * will never cause hooks like useEffect and useMemo to recompute.
 */
export const useStableCallback = <Args extends unknown[], R>(
  callback: (...args: Args) => R
): ((...args: Args) => R) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;
  return useCallback((...args) => callbackRef.current(...args), []);
};
