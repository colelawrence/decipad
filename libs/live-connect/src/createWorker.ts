import { createWorkerClient } from '@decipad/remote-computer-worker/client';
import { captureException } from '@sentry/browser';
import type { SubscribeParams } from './types';

export const createWorker = () => {
  const worker = new Worker(
    new URL('./LiveConnect-2.worker.bundle.js', import.meta.url),
    { type: 'module' }
  );
  worker.onerror = captureException;
  return createWorkerClient<SubscribeParams>(worker);
};
