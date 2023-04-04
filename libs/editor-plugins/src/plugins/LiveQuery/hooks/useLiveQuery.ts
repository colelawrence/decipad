import { useCallback, useEffect, useMemo, useState } from 'react';
import { getNodeString } from '@udecode/plate';
import { Result } from '@decipad/computer';
import { LiveQueryElement } from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { importFromUnknown } from '@decipad/import';
import { fetch } from '@decipad/fetch';
import { useDebounce } from 'use-debounce';
import { getDatabaseUrl } from '../utils/getDatabaseUrl';
import { errorFromFetchResult } from '../utils/errorFromFetchResult';

interface UseLiveQueryParams {
  element: LiveQueryElement;
}

interface UseLiveQueryResult {
  result?: Result.Result;
  error?: string;
  retry: () => void;
}

const MAX_LIVE_QUERY_RESULT_CELL_COUNT = 50_000; // fow now

export const useLiveQuery = ({
  element,
}: UseLiveQueryParams): UseLiveQueryResult => {
  const computer = useComputer();

  const databaseResult = computer.getBlockIdResult$.use(
    element.connectionBlockId
  );
  const url = useMemo(
    () => databaseResult?.result && getDatabaseUrl(databaseResult.result),
    [databaseResult]
  );

  const [generation, setGeneration] = useState(0n);
  const [fetchError, setFetchError] = useState<Error | undefined>();
  const [result, setResult] = useState<Result.Result | undefined>();
  const [debouncedBody] = useDebounce(
    getNodeString(element.children[1]).trim(),
    2000
  );

  useEffect(() => {
    const abort = new AbortController();
    let aborted = false;
    if (url && debouncedBody) {
      fetch(url, {
        body: debouncedBody,
        signal: abort.signal,
        method: 'POST',
      })
        .then(async (fetchResult) => {
          if (fetchResult.ok) {
            return importFromUnknown(computer, fetchResult, {
              maxCellCount: MAX_LIVE_QUERY_RESULT_CELL_COUNT,
            });
          }
          const error =
            (await errorFromFetchResult(fetchResult)) ??
            new Error(fetchResult.statusText);
          throw error;
        })
        .then((importResult) => {
          setResult(importResult[0]?.result);
          setFetchError(undefined);
        })
        .catch((err) => {
          if (!aborted) {
            setFetchError(err);
          }
        });
    }
    return () => {
      aborted = true;
      abort.abort();
    };
  }, [element, url, generation, computer, debouncedBody]);

  useEffect(() => {
    if (result?.value != null && typeof result.value !== 'symbol') {
      computer.pushExternalDataUpdate(element.id, [[element.id, result]]);
    } else {
      computer.pushExternalDataDelete(element.id);
    }
  }, [computer, element.id, result]);

  return {
    error: databaseResult?.error?.message ?? fetchError?.message,
    retry: useCallback(() => {
      setGeneration((g) => g + 1n);
    }, []),
    result,
  };
};
