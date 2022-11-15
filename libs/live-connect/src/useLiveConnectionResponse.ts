import {
  ColIndex,
  ImportElementSource,
  TableCellType,
} from '@decipad/editor-types';
import { formatError } from '@decipad/format';
import { ImportResult } from '@decipad/import';
import { useEffect, useState } from 'react';
import { Unsubscribe } from './types';
import { useLiveConnectionWorker } from './useLiveConnectionWorker';
import { isFatalError } from './utils/isFatalError';

export interface LiveConnectionResponseResult {
  error?: Error;
  result?: ImportResult;
}

export interface LiveConnectionProps {
  url: string;
  options?: RequestInit;
  source?: ImportElementSource;
  useFirstRowAsHeader?: boolean;
  columnTypeCoercions: Record<ColIndex, TableCellType>;
  timeoutMs?: number;
  maxCellCount?: number;
}

export const useLiveConnectionResponse = ({
  url,
  source,
  options,
  useFirstRowAsHeader,
  columnTypeCoercions,
  timeoutMs = 5000,
  maxCellCount,
}: LiveConnectionProps): LiveConnectionResponseResult => {
  const worker = useLiveConnectionWorker();
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
              options,
              source,
              useFirstRowAsHeader,
              columnTypeCoercions,
              maxCellCount,
            },
            (err, res) => {
              if (!canceled) {
                if (err && !isFatalError(err)) {
                  return;
                }
                setError(err);
                if (res) {
                  if (res.result.type.kind === 'type-error') {
                    setError(
                      new Error(
                        formatError('en-US', res.result.type.errorCause)
                      )
                    );
                  } else {
                    setResult(res);
                  }
                }
              }
            }
          );
        } catch (err) {
          if (err && !isFatalError(err as Error)) {
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
    maxCellCount,
    options,
    source,
    url,
    useFirstRowAsHeader,
    worker,
  ]);

  useEffect(() => {
    worker?.worker.addEventListener('error', (ev) => {
      if (!isFatalError(ev.error)) {
        return;
      }
      console.error('Error detected on worker', ev);
      setError(new Error(ev.message));
    });
  }, [worker?.worker]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!result && !error) {
        setError(new Error("Could not find the result you're looking for"));
      }
    }, timeoutMs);
    return () => clearTimeout(timeout);
  }, [error, result, timeoutMs]);

  return { error, result };
};
