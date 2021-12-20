import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

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
    (value) => {
      if (mounted.current) {
        setState(value);
      }
    },
    [mounted]
  );
  return [state, setSafeState];
}
