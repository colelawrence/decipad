import { useEffect } from 'react';
import { ImportResult } from '@decipad/import';
import { LiveConnectionElement } from '@decipad/editor-types';
import { useLiveConnectionResult } from '../contexts/LiveConnectionResultContext';
import { useLiveConnectionStore } from '../store/liveConnectionStore';

interface UseSyncLiveConnectionResultToContextProps {
  element: LiveConnectionElement;
  result?: ImportResult;
  error?: Error;
}

export const useSyncLiveConnectionResultToContext = ({
  element,
  result,
}: UseSyncLiveConnectionResultToContextProps) => {
  const [
    {
      result: persistedResult = result?.result,
      rawResult: persistedRawResult,
      loading,
    },
  ] = useLiveConnectionStore(element);

  const resultInContext = useLiveConnectionResult();
  useEffect(() => {
    if (resultInContext) {
      resultInContext.next({
        result: persistedResult,
        rawResult: persistedRawResult,
        loading: loading ?? false,
      });
    }
  }, [loading, persistedRawResult, persistedResult, resultInContext]);
};
