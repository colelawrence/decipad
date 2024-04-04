import type { Dispatch, RefObject, SetStateAction } from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

export const useMounted = (): RefObject<boolean> => {
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  return mounted;
};

export function useSafeState<S = undefined>(): [
  S | undefined,
  Dispatch<SetStateAction<S | undefined>>
];
export function useSafeState<S>(
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>];
export function useSafeState<S>(
  initialState?: S | (() => S)
): [S | undefined, Dispatch<SetStateAction<S | undefined>>] {
  const mounted = useMounted();
  const [state, setState] = useState<S | undefined>(initialState);

  const setSafeState = useCallback(
    (value: S) => {
      if (mounted.current) {
        setState(value);
      } else {
        // eslint-disable-next-line no-console
        console.log('not mounted');
      }
    },
    [mounted]
  );
  return [state, setSafeState as Dispatch<SetStateAction<S | undefined>>];
}

export function useOverridableState<S>(
  initialState: S | (() => S)
): [S, Dispatch<SetStateAction<S>>];
export function useOverridableState<S>(
  initialState?: S | (() => S)
): [S | undefined, Dispatch<SetStateAction<S | undefined>>] {
  const afterFirst = useRef(false);
  const [state, setState] = useState<S | undefined>(initialState);

  useEffect(() => {
    if (afterFirst.current) {
      setState(initialState);
    } else {
      afterFirst.current = true;
    }
  }, [initialState]);

  return [state, setState];
}
