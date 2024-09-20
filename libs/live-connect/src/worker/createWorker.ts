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
  worker.onerror = (ev) => {
    const { error } = ev;
    if (error instanceof Error) {
      console.error('Error caught on worker', error);
      captureException(error);
    }
  };
  return createWorkerClient<SubscribeParams>(worker, 'live-connect');
};
