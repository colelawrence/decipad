import { BackendUrl } from '@decipad/utils';
import { SafeJs } from '@decipad/safejs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type SafeJsParams = ConstructorParameters<typeof SafeJs>;

/**
 * Use to register a worker with an ID, used to avoid creating extra threads.
 * WARNING: you need to provide stable callbacks `useCallback`, otherwise you'll get render loops.
 */
export function useWorker(
  msgCallback: SafeJsParams[0],
  errorCallback: SafeJsParams[1],
  notebookId: string,
  initOptions?: SafeJsParams[2]
): [SafeJs | undefined, () => void] {
  // Use a ref and worker to keep track of prop changes.
  const workerRef = useRef<SafeJs | undefined>(undefined);
  const [worker, setWorker] = useState<SafeJs | undefined>(undefined);

  const workerOptions = useMemo(
    () => ({
      ...initOptions,
      fetchProxyUrl: BackendUrl.fetchProxy(notebookId).toString(),
    }),
    [notebookId, initOptions]
  );

  // Clean up the worker when component unmounts.
  useEffect(() => {
    if (!workerRef.current) {
      const w = new SafeJs(msgCallback, errorCallback, workerOptions);
      setWorker(w);
      workerRef.current = w;
    }

    return () => {
      if (workerRef.current) {
        workerRef.current?.kill();
        workerRef.current = undefined;
        setWorker(undefined);
      }
    };
  }, [errorCallback, initOptions, msgCallback, workerOptions]);

  const resetWorker = useCallback(() => {
    const w = new SafeJs(msgCallback, errorCallback, workerOptions);
    setWorker(w);
    workerRef.current = w;
  }, [errorCallback, msgCallback, workerOptions]);

  return [worker, resetWorker];
}
