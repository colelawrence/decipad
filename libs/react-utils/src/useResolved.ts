import { useEffect, useMemo, useRef, useState } from 'react';
import type { PromiseOrType } from '@decipad/utils';
import isPromise from 'is-promise';
import { dequal } from '@decipad/utils';

export const useResolved = <T>(_p?: PromiseOrType<T>): T | undefined => {
  const p = useMemo(() => (isPromise(_p) ? _p : Promise.resolve(_p)), [_p]);
  const lastP = useRef(p);
  lastP.current = p;
  const [result, setResult] = useState<T | undefined>();
  const lastResult = useRef<T | undefined>();
  useEffect(() => {
    let canceled = false;
    p.then((r) => {
      if (lastP.current === p && !canceled && !dequal(lastResult.current, r)) {
        lastResult.current = r;
        setResult(r);
      }
    }).catch((err) => {
      console.error(err);
    });

    return () => {
      canceled = true;
    };
  }, [p]);
  return result;
};
