import {
  ColIndex,
  ImportElementSource,
  TableCellType,
} from '@decipad/editor-types';
import { useEffect, useState } from 'react';
import { ImportResult } from '@decipad/import';
import { Unsubscribe } from './types';
import { useLiveConnectionWorker } from './useLiveConnectionWorker';

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
}

export const useLiveConnectionResponse = ({
  url,
  source,
  options,
  useFirstRowAsHeader,
  columnTypeCoercions,
  timeoutMs = 5000,
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
            { url, options, source, useFirstRowAsHeader, columnTypeCoercions },
            (err, res) => {
              if (!canceled) {
                setError(err);
                if (res) {
                  setResult(res);
                }
              }
            }
          );
        } catch (err) {
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
  }, [columnTypeCoercions, options, source, url, useFirstRowAsHeader, worker]);

  useEffect(() => {
    worker?.worker.addEventListener('error', (ev) => {
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
