import {
  ColIndex,
  ImportElementSource,
  TableCellType,
} from '@decipad/editor-types';
import { Result } from '@decipad/computer';
import { useEffect, useState } from 'react';
import { Unsubscribe } from './types';
import { useLiveConnectionWorker } from './useLiveConnectionWorker';

export interface LiveConnectionResponseResult {
  error?: Error;
  result?: Result.Result;
}

export interface LiveConnectionProps {
  url: string;
  options?: RequestInit;
  source?: ImportElementSource;
  useFirstRowAsHeader?: boolean;
  columnTypeCoercions: Record<ColIndex, TableCellType>;
}

export const useLiveConnectionResponse = ({
  url,
  source,
  options,
  useFirstRowAsHeader,
  columnTypeCoercions,
}: LiveConnectionProps): LiveConnectionResponseResult => {
  const worker = useLiveConnectionWorker();
  const [error, setError] = useState<Error | undefined>();
  const [result, setResult] = useState<Result.Result | undefined>();

  useEffect(() => {
    let unsubscribe: Unsubscribe | undefined;
    let canceled = false;
    (async () => {
      if (worker) {
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
      }
    })();

    return () => {
      canceled = true;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [columnTypeCoercions, options, source, url, useFirstRowAsHeader, worker]);

  return { error, result };
};
