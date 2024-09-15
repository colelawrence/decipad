import { useCallback, useEffect, useMemo, useState } from 'react';
import type {
  ColIndex,
  ImportElementSource,
  LiveQueryElement,
  TableCellType,
} from '@decipad/editor-types';
import { formatError } from '@decipad/format';
import type { ImportResult } from '@decipad/import';
import { hydrateType } from '@decipad/remote-computer';
import { useLiveConnectionWorker } from '@decipad/editor-hooks';
import type { Unsubscribe } from './types';
import { isFatalError } from './utils/isFatalError';
import { noop } from '@decipad/utils';

export interface LiveConnectionResponseResult {
  error?: Error;
  result?: ImportResult;
  retry: () => void;
}

export interface LiveConnectionProps {
  url: string;
  proxy?: string;
  options?: RequestInit;
  source?: ImportElementSource;
  useFirstRowAsHeader?: boolean;
  columnTypeCoercions: Record<ColIndex, TableCellType>;
  maxCellCount?: number;
  jsonPath?: string;
  delimiter?: string;
  liveQuery?: LiveQueryElement;
  useCache?: boolean;
}

export const useLiveConnectionResponse = ({
  url,
  proxy,
  source,
  options,
  useFirstRowAsHeader,
  columnTypeCoercions,
  maxCellCount,
  jsonPath,
  delimiter,
  liveQuery,
  useCache,
}: LiveConnectionProps): LiveConnectionResponseResult => {
  const worker = useLiveConnectionWorker();
  const [gen, setGen] = useState(-1);
  const [error, setError] = useState<Error | undefined>();
  const [result, setResult] = useState<ImportResult | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  const subscribe = useCallback(async (): Promise<Unsubscribe> => {
    let realUnsubscribe: Unsubscribe | undefined;
    let canceled = false;
    try {
      realUnsubscribe = await worker.subscribe(
        {
          url,
          proxy,
          options,
          source,
          useFirstRowAsHeader,
          columnTypeCoercions,
          maxCellCount,
          jsonPath,
          delimiter,
          liveQuery,
          useCache,
        },
        (err, _, res) => {
          if (!canceled) {
            if (err && !isFatalError(err.message)) {
              return;
            }
            setError(err);
            if (res) {
              if (res.result?.type.kind === 'type-error') {
                setError(
                  new Error(formatError('en-US', res.result.type.errorCause))
                );
              } else if (res.result) {
                setResult({
                  ...res,
                  result: {
                    ...res.result,
                    type: hydrateType(res.result.type),
                  },
                });
              }
              if (res.loading != null) {
                setLoading(res.loading);
              }
            }
          }
        }
      );
    } catch (err) {
      if (err && !isFatalError((err as Error).message)) {
        return noop;
      }
      console.error(err);
      setError(err as Error);
    }

    return () => {
      canceled = true;
      realUnsubscribe?.();
    };
  }, [
    columnTypeCoercions,
    delimiter,
    jsonPath,
    liveQuery,
    maxCellCount,
    options,
    proxy,
    source,
    url,
    useCache,
    useFirstRowAsHeader,
    worker,
  ]);

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    (async () => {
      unsubscribe = await subscribe();
    })();

    return () => {
      unsubscribe?.();
    };
  }, [subscribe, gen]); // make unsubscribe / subscribe happen again when gen changes

  useEffect(() => {
    const { worker: workerWorker } = worker ?? {};
    if (!workerWorker || !(workerWorker instanceof Worker)) {
      return;
    }
    workerWorker.addEventListener('error', (ev) => {
      if (!isFatalError(ev.message)) {
        return;
      }
      console.error('Error detected on worker', ev);
      setError(new Error(ev.message));
    });
  }, [worker]);

  const retry = useCallback(() => {
    setError(undefined);
    setResult(undefined);
    setGen((g) => g + 1); // will make the subscribe happen again
  }, []);

  return useMemo(
    () => ({
      error,
      result: {
        ...result,
        loading,
      },
      retry,
    }),
    [error, loading, result, retry]
  );
};
