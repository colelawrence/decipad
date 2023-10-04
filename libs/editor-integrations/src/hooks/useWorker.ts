import { BackendUrl } from '@decipad/utils';
import { SafeJs } from '@decipad/safejs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useNotebookId } from '@decipad/react-contexts';

/**
 * Use to register a worker with an ID, used to avoid creating extra threads.
 * WARNING: you need to provide stable callbacks `useCallback`, otherwise you'll get render loops.
 */
export function useWorker(
  ...[msgCallback, errorCallback, initOptions]: ConstructorParameters<
    typeof SafeJs
  >
): SafeJs | undefined {
  // Use a ref and worker to keep track of prop changes.
  const workerRef = useRef<SafeJs | undefined>(undefined);
  const [worker, setWorker] = useState<SafeJs | undefined>(undefined);
  const notebookId = useNotebookId();

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

  return worker;
}
