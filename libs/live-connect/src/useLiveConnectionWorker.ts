import { useEffect, useRef, useState } from 'react';
import { LiveConnectionWorker } from './types';

export const useLiveConnectionWorker = (
  workerGen: number
): LiveConnectionWorker | undefined => {
  const workerGenRef = useRef(workerGen);
  const workerRef = useRef<LiveConnectionWorker>();
  const [worker, setWorker] = useState<LiveConnectionWorker | undefined>();

  useEffect(() => {
    if (workerGen !== workerGenRef.current) {
      workerGenRef.current = workerGen;
    }
    let cancelled = false;
    if (!workerRef.current) {
      (async () => {
        const { createWorker } = await import('./createWorker');
        const w = await createWorker();
        workerRef.current = w;
        if (cancelled) return;
        setWorker(w);
      })();
    }
    return () => {
      cancelled = true;

      const w = workerRef.current;
      if (w) {
        workerRef.current = undefined;
        setWorker(undefined);
        w.terminate();
      }
    };
  }, [workerGen]);

  return worker;
};
