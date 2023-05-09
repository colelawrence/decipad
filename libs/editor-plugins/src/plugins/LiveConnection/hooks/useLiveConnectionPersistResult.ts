import { useEffect } from 'react';
import {
  LiveConnectionElement,
  LiveDataSetElement,
} from '@decipad/editor-types';
import { ImportResult } from '@decipad/import';
import { useLiveConnectionStore } from '../store/liveConnectionStore';

interface UseLiveConnectionPersistResultProps {
  element: LiveConnectionElement | LiveDataSetElement;
  result?: ImportResult;
  error?: Error;
}

export const useLiveConnectionPersistResult = ({
  element,
  result,
  error,
}: UseLiveConnectionPersistResultProps) => {
  // persist results
  const [persistedResult, set] = useLiveConnectionStore(element);

  useEffect(() => {
    if (result) {
      if (result.result != null && persistedResult?.result !== result.result) {
        set({
          ...persistedResult,
          result: result.result,
          rawResult: result.rawResult,
          loading: false,
        });
      }
      if (
        result.loading != null &&
        persistedResult?.loading !== result.loading
      ) {
        set({
          ...persistedResult,
          loading: result.loading,
        });
      }
    }
    if (error && persistedResult?.error !== error) {
      set({
        ...persistedResult,
        error,
      });
    }
  }, [element, error, persistedResult, result, set]);
};
