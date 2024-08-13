/* eslint-disable no-console */
/* eslint-disable no-restricted-globals */
import { nanoid } from 'nanoid';
import type { Result } from '@decipad/language-interfaces';
import { Unknown } from '@decipad/language-interfaces';
import { encodeColumn } from '@decipad/remote-computer-codec';
import { RPC } from '@decipad/postmessage-rpc';
// eslint-disable-next-line no-restricted-imports
import type { RemoteValueStore, TBaseNotificationParams } from '../types';
import { encodeTable } from '../encode/encodeTable';
import { createNotificationEncoder } from '../encode/createNotificationEncoder';
import type { CreateWorkerWorkerOptions, TUnsubscribe } from './types';
import { debug } from './debug';
import { encodeMetaLabels } from '../encode/encodeMetaLabels';
import { createRemoteValueStore } from './createRemoteValueStore';

const unknownRemoteValue: Result.Result = {
  type: { kind: 'anything' },
  value: Unknown,
  meta: undefined,
};

export const createWorkerWorker = <
  TSubscribeOptions,
  TNotification,
  TSerializedNotification
>({
  postMessage,
  readMessages,
  subscribe,
  serializeNotificationFromStore,
  serviceId = 'remote-computer-worker',
}: CreateWorkerWorkerOptions<
  TSubscribeOptions,
  TNotification,
  TSerializedNotification
>) => {
  const remoteValueStore: RemoteValueStore = createRemoteValueStore();
  const serializeNotification = (
    serializeNotificationFromStore ?? createNotificationEncoder
  )(remoteValueStore);

  const rpc = new RPC({
    target: {
      postMessage,
    },
    receiver: {
      readMessages,
    },
    serviceId,
  });

  rpc.on('error', (error: Error) => {
    console.error(error);
  });

  rpc.expose(
    'getValue',
    async ({
      valueId,
      start = 0,
      end = Infinity,
    }: {
      valueId: string;
      start: number;
      end: number;
    }): Promise<ArrayBuffer> => {
      debug('getValue', valueId, { start, end });
      await rpc.isReady;
      const value = remoteValueStore.get(valueId) ?? unknownRemoteValue;
      if (
        value.type.kind === 'column' ||
        value.type.kind === 'materialized-column'
      ) {
        // serialize column
        return encodeColumn(value, start, end);
      }

      // serialize table
      return encodeTable(remoteValueStore, value);
    }
  );

  rpc.expose(
    'getMeta',
    async ({
      valueId,
      start = 0,
      end = Infinity,
    }: {
      valueId: string;
      start?: number;
      end?: number;
    }): Promise<ArrayBuffer> => {
      debug('getMeta', valueId, { start, end });
      await rpc.isReady;
      const value = remoteValueStore.get(valueId) ?? unknownRemoteValue;
      const labels = ((await value.meta?.()?.labels) ?? []).slice(start, end);
      return encodeMetaLabels(labels);
    }
  );

  // This is called by the client to garbage-collect a value
  rpc.expose('releaseValue', ({ valueId }: { valueId: string }) => {
    debug('releaseValue', valueId);
    console.log('releaseValue', valueId);
    remoteValueStore.delete(valueId);
  });

  const subscriptions = new Map<string, TUnsubscribe>();

  rpc.expose(
    'subscribe',
    async (params: TSubscribeOptions & { newSubscriptionId?: string }) => {
      debug('subscribe', params);
      await rpc.isReady;
      const subscriptionId = params.newSubscriptionId ?? nanoid();
      const unsubscribe = await subscribe(params, async (notification) => {
        const serializedNotification = await serializeNotification(
          subscriptionId,
          notification as TNotification & TBaseNotificationParams<object>
        );
        await rpc.call('notify', serializedNotification ?? {});
      });
      subscriptions.set(subscriptionId, unsubscribe);
      return subscriptionId;
    }
  );

  rpc.expose(
    'unsubscribe',
    ({ subscriptionId }: { subscriptionId: string }) => {
      debug('unsubscribe', { subscriptionId });
      const unsubscribe = subscriptions.get(subscriptionId);
      if (unsubscribe) {
        unsubscribe();
        subscriptions.delete(subscriptionId);
      }
    }
  );

  return { rpc, remoteValueStore };
};
