import { useEffect, useMemo, useState } from 'react';
import type { PromiseOrType } from '@decipad/utils';
import usePromise from 'react-use-promise';
import isPromise from 'is-promise';
import { dequal } from 'dequal';

export const useResolved = <T>(_p?: PromiseOrType<T>): T | undefined => {
  const p = useMemo(() => (isPromise(_p) ? _p : Promise.resolve(_p)), [_p]);
  const [result, error] = usePromise(p, [p]);
  const [dedupedResult, setDedupedResult] = useState<T | undefined>();
  useEffect(() => {
    if (error) {
      throw error;
    }
    if (result != null && !dequal(result, dedupedResult)) {
      setDedupedResult(result);
    }
  }, [dedupedResult, error, result]);

  return dedupedResult;
};
