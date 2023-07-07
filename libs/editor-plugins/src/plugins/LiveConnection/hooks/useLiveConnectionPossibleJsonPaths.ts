import { useEffect, useMemo, useState } from 'react';
import { ImportResult } from '@decipad/import';
import { jsonPathsFromObject } from '../utils/jsonPathsFromObject';
import { useLiveConnectionResult$ } from '../contexts/LiveConnectionResultContext';

export const useLiveConnectionPossibleJsonPaths = () => {
  const result$ = useLiveConnectionResult$();
  const [result, setResult] = useState<ImportResult | undefined>();

  useEffect(() => {
    const sub = result$?.subscribe((r) => setResult(r.result));
    return () => sub?.unsubscribe();
  }, [result$]);

  return useMemo(
    () =>
      result?.rawResult && typeof result.rawResult === 'object'
        ? jsonPathsFromObject(result.rawResult)
        : [],
    [result?.rawResult]
  );
};
