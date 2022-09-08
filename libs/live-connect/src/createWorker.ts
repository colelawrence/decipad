import { RPC } from '@mixer/postmessage-rpc';
import { createResponse } from './createResponse';
import {
  LiveConnectionWorker,
  RPCResponse,
  SubscriptionId,
  SubscriptionListener,
} from './types';

interface StartWorkerResult {
  worker: Worker;
  rpc: RPC;
}

const createRPCWorker = async (): Promise<StartWorkerResult> => {
  const worker = new Worker(new URL('./LiveConnect.worker', import.meta.url));

  const rpc = new RPC({
    target: {
      postMessage: (data) => {
        worker.postMessage(data);
      },
    },
    receiver: {
      readMessages: (cb) => {
        const listener = (ev: MessageEvent) => {
          cb(ev);
        };
        worker.addEventListener('message', listener);

        return () => worker.removeEventListener('message', listener);
      },
    },
    serviceId: 'live-connect',
  });

  await rpc.isReady;

  return { worker, rpc };
};

type Notification = {
  subscriptionId: SubscriptionId;
  newResponse?: RPCResponse;
  error?: string;
};

export const createWorker = async (): Promise<LiveConnectionWorker> => {
  const listeners = new Map<SubscriptionId, SubscriptionListener>();
  const { worker, rpc } = await createRPCWorker();

  rpc.expose<Notification>(
    'notify',
    ({ subscriptionId, error, newResponse }) => {
      const listener = listeners.get(subscriptionId);
      if (listener) {
        const response = newResponse && createResponse(newResponse);
        try {
          listener((error != null && new Error(error)) || undefined, response);
        } catch (err) {
          console.error('Error caught while notifying subscriber', err);
        }
      }
    }
  );

  return {
    subscribe: async (params, listener) => {
      const subscriptionId = await rpc.call<string>('subscribe', params);
      listeners.set(subscriptionId, listener);
      return async () => {
        listeners.delete(subscriptionId);
        await rpc.call('unsubscribe', { subscriptionId });
      };
    },
    terminate: () => {
      listeners.clear();
      worker.terminate();
    },
    worker,
  };
};
