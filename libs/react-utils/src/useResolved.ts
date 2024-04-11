import { useEffect, useRef, useState } from 'react';
import type { PromiseOrType } from '@decipad/utils';

export const useResolved = <T>(p?: PromiseOrType<T>): T | undefined => {
  const [resolved, setResolved] = useState<T | undefined>();
  const latest = useRef<PromiseOrType<T> | undefined>();

  useEffect(() => {
    if (p == null) {
      return;
    }
    if (latest.current === p) {
      return;
    }
    latest.current = p;
    (async () => {
      if (p == null) {
        return;
      }
      const newResult = await Promise.resolve(p);
      if (latest.current === p) {
        setResolved(newResult);
      }
    })();
  }, [p]);
  return resolved;
};
