import { useCallback, useEffect, useRef, useState } from 'react';
import isPromise from 'is-promise';
import { PromiseOrType, dequal } from '@decipad/utils';

export const useResolved = <T>(p?: PromiseOrType<T>): T | undefined => {
  const lastP = useRef(p);
  lastP.current = p;
  const initialResult = isPromise(p) ? undefined : p;
  const [result, setResult] = useState<T | undefined>(initialResult);
  const lastResult = useRef<T | undefined>(initialResult);
  const lastResultP = useRef<PromiseOrType<T> | undefined>();

  const setResultSafe = useCallback(
    (r: T) => {
      if (lastP.current === p && !dequal(lastResult.current, r)) {
        lastResult.current = r;
        lastResultP.current = p;
        setResult(r);
      }
    },
    [p]
  );

  useEffect(() => {
    let canceled = false;
    if (lastResultP.current !== p) {
      if (isPromise(p)) {
        p.then((r) => {
          if (!canceled) {
            setResultSafe(r);
          }
        }).catch((err: Error) => {
          console.error(err);
        });
      } else if (p != null) {
        setResultSafe(p);
      }
    }

    return () => {
      canceled = true;
    };
  }, [p, setResultSafe]);
  return result;
};
