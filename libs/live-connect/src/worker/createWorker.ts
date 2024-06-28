// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { createWorkerClient } from '@decipad/remote-computer-worker/client';
import { captureException } from '@sentry/browser';
import type { SubscribeParams } from '../types';

export const createWorker = () => {
  const workerUrl = new URL(
    './LiveConnect-5.worker.bundle.js',
    import.meta.url
  );
  const worker = new Worker(workerUrl, {
    /* @vite-ignore */
    name: 'live-connect',
    type: 'module',
  });
  worker.onerror = (err: unknown) => {
    console.error('Error caught on worker', err);
    captureException(err);
  };
  return createWorkerClient<SubscribeParams>(worker, 'live-connect');
};
