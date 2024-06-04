import { useCallback, useEffect, useState } from 'react';
import { getNodeString, isElement } from '@udecode/plate-common';
import type { Result } from '@decipad/remote-computer';
import type { LiveQueryElement } from '@decipad/editor-types';
import { MAX_IMPORT_CELL_COUNT } from '@decipad/editor-types';
import { useComputer } from '@decipad/react-contexts';
import { importFromUnknown } from '@decipad/import';
import { fetch } from '@decipad/fetch';
import { useLiveConnectionUrl } from './useLiveConnectionUrl';
import { errorFromFetchResult } from '../utils/errorFromFetchResult';

interface UseLiveQueryParams {
  element: LiveQueryElement;
}

export type RemoteDataStatus = 'not asked' | 'loading' | 'success' | 'error';

export type RemoteData = {
  status: RemoteDataStatus;
  error?: string;
  result?: Result.Result;
};

export type UseLiveQueryResult = {
  runQuery: () => void;
} & RemoteData;

export const useLiveQuery = ({
  element,
}: UseLiveQueryParams): UseLiveQueryResult => {
  const computer = useComputer();

  const url = useLiveConnectionUrl(element, computer);

  const [rd, setRd] = useState<RemoteData>({ status: 'not asked' });

  const query = getNodeString(element.children[1]).trim();

  const runQuery = useCallback(() => {
    setRd({ status: 'loading' });
    const abort = new AbortController();
    let aborted = false;
    if (url && query) {
      fetch(url, {
        body: query,
        signal: abort.signal,
        method: 'POST',
      })
        .then(async (fetchResult) => {
          if (fetchResult.ok) {
            return importFromUnknown(computer, fetchResult, {
              maxCellCount: MAX_IMPORT_CELL_COUNT,
            });
          }
          const error =
            (await errorFromFetchResult(fetchResult)) ??
            new Error(fetchResult.statusText);
          throw error;
        })
        .then((importResult) => {
          setRd({
            status: 'success',
            result: importResult[0]?.result,
          });
        })
        .catch((err) => {
          if (!aborted) {
            setRd({
              status: 'error',
              error: err,
            });
          }
        });
    }
    return () => {
      aborted = true;
      abort.abort();
    };
  }, [url, computer, query]);

  useEffect(() => {
    if (
      rd.status === 'success' &&
      rd.result != null &&
      typeof rd.result.value !== 'string'
    ) {
      computer.pushExternalDataUpdate([[element.id, rd.result]]);
    } else if (isElement(element)) {
      computer.pushExternalDataDelete([element.id]);
    }
  }, [computer, element, rd]);

  return {
    ...rd,
    runQuery,
  };
};
