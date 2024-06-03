import type { Result, SerializedType } from '@decipad/language-interfaces';
import { fnQueue } from '@decipad/fnqueue';
import type {
  TBaseNotificationParams,
  TSerializedNotificationParams,
} from '../types';
import { decodeString } from './decodeString';
import { decoders, valueDecoder } from './valueDecoder';
import type { ClientWorkerContext } from './types';
import { streamingValue } from './streamingValue';
import { SharedRPC } from '../utils/SharedRPC';

export type SubscriptionId = string;

export type SubscriptionListener<TNotificationParams extends object> = (
  error: Error | undefined,
  response: TNotificationParams
) => void;

export type Unsubscribe = () => void;

export interface RemoteWorker<
  TSubscriptionParams extends object,
  TNotificationParams extends object
> {
  subscribe: (
    props: TSubscriptionParams,
    listener: SubscriptionListener<TNotificationParams>
  ) => Promise<Unsubscribe>;
  terminate: () => void;
  worker: Worker;
}

const createRPCWorker = (worker: Worker) => {
  return new SharedRPC({
    target: {
      postMessage: (data) => {
        worker.postMessage(data);
      },
    },
    receiver: {
      readMessages: (cb) => {
        worker.addEventListener('message', cb);

        return () => worker.removeEventListener('message', cb);
      },
    },
    serviceId: 'remote-computer-worker',
  });
};

const recursiveDeserializeRemoteValue = async (
  ctx: ClientWorkerContext,
  buffer: DataView,
  _offset: number,
  type: SerializedType
): Promise<[Result.OneResult, number]> => {
  let offset = _offset;
  switch (type.kind) {
    case 'anything':
    case 'pending':
    case 'nothing':
    case 'type-error':
    case 'boolean':
    case 'function':
    case 'number':
    case 'row':
    case 'tree':
    case 'range':
    case 'string':
    case 'date':
      return valueDecoder(type)(buffer, offset);
    // these following types are held in the remoteValueStore
    case 'table':
    case 'materialized-table':
    case 'materialized-column':
    case 'column': {
      let valueId;
      [valueId, offset] = decodeString(buffer, offset);
      const value = await streamingValue(ctx, type, valueId, decoders);
      ctx.finalizationRegistry.register(value, valueId);
      ctx.refCounter.set(valueId, (ctx.refCounter.get(valueId) || 0) + 1);
      return [value, offset];
    }
  }
};

const deserializeNotification = async <TMeta extends object = object>(
  ctx: ClientWorkerContext,
  notification: TSerializedNotificationParams<TMeta>
): Promise<TBaseNotificationParams<TMeta>> => {
  return {
    ...notification,
    result:
      notification.result == null
        ? undefined
        : {
            type: notification.result.type,
            value: (
              await recursiveDeserializeRemoteValue(
                ctx,
                new DataView(notification.result.value),
                0,
                notification.result.type
              )
            )[0],
          },
  };
};

export const createWorkerClient = <
  TSubscriptionParams extends object,
  TMeta extends object = object
>(
  worker: Worker
): RemoteWorker<TSubscriptionParams, TBaseNotificationParams<TMeta>> => {
  const listeners = new Map<
    SubscriptionId,
    SubscriptionListener<TBaseNotificationParams<TMeta>>
  >();
  const rpc = createRPCWorker(worker);

  const queue = fnQueue({
    onError: (err) => {
      // eslint-disable-next-line no-console
      console.error('Error caught in worker client queue', err);
    },
  });

  const ctx: ClientWorkerContext = {
    rpc,
    finalizationRegistry: new FinalizationRegistry((valueId: string) => {
      const newRefCount = (ctx.refCounter.get(valueId) ?? 0) - 1;
      if (newRefCount <= 0) {
        ctx.refCounter.delete(valueId);
        rpc.call('releaseValue', { valueId }, false);
      } else {
        ctx.refCounter.set(valueId, newRefCount);
      }
    }),
    refCounter: new Map(),
  };

  rpc.expose<
    TSerializedNotificationParams<TMeta> & {
      error?: string;
      subscriptionId: string;
    }
  >('notify', async ({ error, subscriptionId, ...restParams }) =>
    queue.push(async () => {
      const listener = listeners.get(subscriptionId);
      if (listener) {
        listener(
          (error != null && new Error(error)) || undefined,
          await deserializeNotification(
            ctx,
            restParams as TSerializedNotificationParams<TMeta>
          )
        );
      }
    })
  );

  return {
    subscribe: async (params, listener) =>
      queue.push(async () => {
        await rpc.isReady;
        const subscriptionId = await rpc.call<string>('subscribe', params);
        listeners.set(subscriptionId, listener);
        return async () => {
          listeners.delete(subscriptionId);
          await rpc.call('unsubscribe', { subscriptionId });
        };
      }),
    terminate: () => {
      listeners.clear();
      worker.terminate();
    },
    worker,
  };
};
