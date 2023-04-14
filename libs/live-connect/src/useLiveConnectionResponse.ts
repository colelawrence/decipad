import { useCallback, useEffect, useState } from 'react';
import {
  ColIndex,
  ImportElementSource,
  TableCellType,
} from '@decipad/editor-types';
import { formatError } from '@decipad/format';
import { ImportResult } from '@decipad/import';
import { deserializeResult } from '@decipad/editor-utils';
import { Unsubscribe } from './types';
import { useLiveConnectionWorker } from './useLiveConnectionWorker';
import { isFatalError } from './utils/isFatalError';

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
}: LiveConnectionProps): LiveConnectionResponseResult => {
  const [workerGen, setWorkerGen] = useState(0);
  const worker = useLiveConnectionWorker(workerGen);
  const [error, setError] = useState<Error | undefined>();
  const [result, setResult] = useState<ImportResult | undefined>();

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    let canceled = false;
    (async () => {
      if (worker) {
        try {
          unsubscribe = await worker.subscribe(
            {
              url,
              proxy,
              options,
              source,
              useFirstRowAsHeader,
              columnTypeCoercions,
              maxCellCount,
              jsonPath,
            },
            (err, res) => {
              if (!canceled) {
                if (err && !isFatalError(err.message)) {
                  return;
                }
                setError(err);
                if (res) {
                  if (res.result?.type.kind === 'type-error') {
                    setError(
                      new Error(
                        formatError('en-US', res.result.type.errorCause)
                      )
                    );
                  } else {
                    setResult({
                      ...res,
                      result: deserializeResult(res.result),
                    });
                  }
                }
              }
            }
          );
        } catch (err) {
          if (err && !isFatalError((err as Error).message)) {
            return;
          }
          console.error(err);
          setError(err as Error);
        }
      }
    })();

    return () => {
      canceled = true;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [
    columnTypeCoercions,
    jsonPath,
    maxCellCount,
    options,
    proxy,
    source,
    url,
    useFirstRowAsHeader,
    worker,
  ]);

  useEffect(() => {
    worker?.worker.addEventListener('error', (ev) => {
      if (!isFatalError(ev.message)) {
        return;
      }
      console.error('Error detected on worker', ev);
      setError(new Error(ev.message));
    });
  }, [worker?.worker]);

  const retry = useCallback(() => {
    setError(undefined);
    setResult(undefined);
    setWorkerGen((gen) => gen + 1);
  }, []);

  return { error, result, retry };
};
