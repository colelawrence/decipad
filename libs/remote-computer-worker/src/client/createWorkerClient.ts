import { fnQueue } from '@decipad/fnqueue';
import type { PromiseOrType } from '@decipad/utils';
import type {
  TBaseNotificationParams,
  TSerializedNotificationParams,
} from '../types';
import type { ClientWorkerContext } from './types';
import { SharedRPC } from '../utils/SharedRPC';
import { decodeNotification as defaultDecodeNotification } from './decodeNotification';
import { debug } from './debug';
import { nanoid } from 'nanoid';

export type SubscriptionId = string;

export type SubscriptionListener<TSubscriptionParams, TNotificationParams> = (
  error: Error | undefined,
  subscriptionParams: TSubscriptionParams,
  response: TNotificationParams
) => void;

export type Subscription<TSubscriptionParams, TNotificationParams> = {
  subscriptionParams: TSubscriptionParams;
  listener: SubscriptionListener<TSubscriptionParams, TNotificationParams>;
};

export type Unsubscribe = () => void;

export interface RemoteWorker<TSubscriptionParams, TNotificationParams> {
  subscribe: (
    props: TSubscriptionParams,
    listener: SubscriptionListener<TSubscriptionParams, TNotificationParams>
  ) => Promise<Unsubscribe>;
  terminate: () => void;
  call: <T>(method: string, params: object) => Promise<T>;
  worker: Worker;
  context: ClientWorkerContext;
}

const createRPCWorker = (
  worker: Worker,
  serviceId = 'remote-computer-worker'
) => {
  return new SharedRPC({
    target: {
      postMessage: (data) => {
        worker.postMessage(data);
      },
    },
    receiver: {
      readMessages: (notify) => {
        const cb = (event: MessageEvent) => {
          debug('Received message from worker', event.data);
          notify(event);
        };
        worker.addEventListener('message', cb);

        return () => {
          worker.removeEventListener('message', cb);
        };
      },
    },
    serviceId,
  });
};

export type TransformNotification<
  TSubscriptionParams,
  TSerNotificationParams,
  TNotificationParams
> = (
  context: ClientWorkerContext,
  subscriptionParams: TSubscriptionParams,
  notification: TSerNotificationParams
) => PromiseOrType<TNotificationParams>;

export const createWorkerClient = <
  TSubscriptionParams,
  TNotificationParams = TBaseNotificationParams<object>,
  TSerNotificationParams = TSerializedNotificationParams<object>
>(
  worker: Worker,
  serviceId: string,
  decodeNotification: TransformNotification<
    TSubscriptionParams,
    TSerNotificationParams,
    TNotificationParams
    // TODO: fix this:
  > = defaultDecodeNotification as unknown as TransformNotification<
    TSubscriptionParams,
    TSerNotificationParams,
    TNotificationParams
  >
): RemoteWorker<TSubscriptionParams, TNotificationParams> => {
  const subscribers = new Map<
    SubscriptionId,
    Subscription<TSubscriptionParams, TNotificationParams>
  >();
  const rpc = createRPCWorker(worker, serviceId);

  const queue = fnQueue({
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('Error caught in worker client queue', err);
    },
  });

  const context: ClientWorkerContext = {
    rpc,
    finalizationRegistry: new FinalizationRegistry((valueId: string) => {
      const newRefCount = (context.refCounter.get(valueId) ?? 0) - 1;
      if (newRefCount <= 0) {
        context.refCounter.delete(valueId);
        rpc.call('releaseValue', { valueId }, false);
      } else {
        context.refCounter.set(valueId, newRefCount);
      }
    }),
    refCounter: new Map(),
  };

  rpc.expose<
    TSerNotificationParams & {
      error?: string;
      subscriptionId: string;
    }
  >('notify', async (notification) => {
    const { error, subscriptionId, ...restParams } = notification;
    return queue.push(async () => {
      const subscriber = subscribers.get(subscriptionId);
      if (subscriber) {
        subscriber.listener(
          (error != null && new Error(error)) || undefined,
          subscriber.subscriptionParams,
          await decodeNotification(
            context,
            subscriber.subscriptionParams,
            restParams as TSerNotificationParams
          )
        );
      } else {
        // eslint-disable-next-line no-console
        console.warn('Worker client: no subscriber found', subscriptionId);
      }
    });
  });

  return {
    subscribe: async (params, listener) => {
      return queue.push(async () => {
        await rpc.isReady;
        const subscriptionId = nanoid();
        subscribers.set(subscriptionId, {
          subscriptionParams: params,
          listener,
        });
        const responseSubscriptionId = await rpc.call<string>('subscribe', {
          ...(params ?? {}),
          newSubscriptionId: subscriptionId,
        });
        if (responseSubscriptionId !== subscriptionId) {
          throw new Error(
            `Subscription id mismatch: ${responseSubscriptionId} !== ${subscriptionId}`
          );
        }
        return async () => {
          subscribers.delete(subscriptionId);
          await rpc.call('unsubscribe', { subscriptionId });
        };
      });
    },
    terminate: () => {
      subscribers.clear();
      worker.terminate();
    },
    call: async (method: string, params: object) => {
      await rpc.isReady;
      return rpc.call(method, params);
    },
    worker,
    context,
  };
};
