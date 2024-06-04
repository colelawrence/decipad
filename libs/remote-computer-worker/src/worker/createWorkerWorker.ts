/* eslint-disable no-console */
/* eslint-disable no-restricted-globals */
import '../utils/workerPolyfills';
import { nanoid } from 'nanoid';
import {
  Unknown,
  type Result,
  type SerializedType,
  type Value as ValueTypes,
} from '@decipad/language-interfaces';
import type { PromiseOrType } from '@decipad/utils';
// eslint-disable-next-line no-restricted-imports
import { Value, getResultGenerator } from '@decipad/language-types';
import type {
  TBaseNotificationParams,
  TSerializedNotificationParams,
} from '../types';
import { valueEncoder } from './valueEncoder';
import { encodeString } from './encodeString';
import { SharedRPC } from '../utils/SharedRPC';

export interface RemoteValueReference {
  type: 'remote-value-ref';
  id: string;
}

export interface InlineValueReference {
  type: 'inline-value-ref';
  serialized: ArrayBuffer;
}

export interface RemoteValue {
  type: SerializedType;
  value: Result.OneResult;
}

export type ValueReference = RemoteValueReference | InlineValueReference;

export type TUnsubscribe = () => void;

const unknownRemoteValue: RemoteValue = {
  type: { kind: 'anything' },
  value: Unknown,
};

const initialBufferSize = 1024 * 10;
const pageSize = 1024;
const maxBufferSize = 1024 * 1024 * 50; // 50MB

export interface CreateWorkerWorkerOptions<
  TSubscriptionParams extends object,
  TNotifyParams extends object
> {
  postMessage: (data: unknown) => void;
  readMessages: (cb: (ev: MessageEvent) => void) => () => void;
  subscribe: (
    options: TSubscriptionParams,
    listener: (notificationParams: TNotifyParams) => unknown
  ) => PromiseOrType<TUnsubscribe>;
}

export const createWorkerWorker = <
  TSubscriptionParams extends object = object,
  TNotifyParams extends object = object
>({
  postMessage,
  readMessages,
  subscribe,
}: CreateWorkerWorkerOptions<TSubscriptionParams, TNotifyParams>) => {
  const remoteValueStore: Map<string, RemoteValue> = new Map();

  const serializeTable = async (
    type: Result.Result['type'],
    value: Result.Result['value']
  ): Promise<ArrayBuffer> => {
    if (type.kind !== 'table' && type.kind !== 'materialized-table') {
      throw new TypeError(`Expected table-like type and got ${type.kind}`);
    }
    let offset = 0;
    if (!Array.isArray(value)) {
      throw new TypeError('Table: Expected array');
    }

    const targetBuffer = new Value.GrowableDataView(
      new ArrayBuffer(initialBufferSize, {
        maxByteLength: maxBufferSize,
      }),
      { pageSize }
    );

    targetBuffer.setUint32(offset, value.length);
    offset += 4;

    let colIndex = -1;
    for (const col of value) {
      colIndex += 1;
      const encoderType =
        typeof col === 'function' ? 'column' : 'materialized-column';
      const encoderSType: SerializedType = {
        kind: encoderType,
        cellType: type.columnTypes[colIndex],
        indexedBy: type.indexName,
      };
      const valueId = nanoid();
      remoteValueStore.set(valueId, { type: encoderSType, value: col });
      // just send the id of the value so that it can be streamed later
      offset = encodeString(targetBuffer, offset, valueId);
    }

    return targetBuffer.seal(offset);
  };

  const recursiveSerializeRemoteValue = async (
    buffer: DataView,
    offset: number,
    result: Result.Result
  ): Promise<number> => {
    let { type, value } = result;
    if (value == null) {
      value = Unknown;
      type = { kind: 'anything' };
    }
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
        return valueEncoder(type)(buffer, offset, value);
      // these following types are held in the remoteValueStore
      case 'table':
      case 'materialized-table':
      case 'materialized-column':
      case 'column': {
        const valueId = nanoid();
        remoteValueStore.set(valueId, { type, value });
        // just send the id of the value so that it can be streamed later
        return encodeString(buffer, offset, valueId);
      }
    }
  };

  const serializeRemoteValue = async (
    result: Result.Result
  ): Promise<ArrayBuffer> => {
    const targetBuffer = new Value.GrowableDataView(
      new ArrayBuffer(initialBufferSize, {
        maxByteLength: maxBufferSize,
      }),
      { pageSize }
    );
    const finalOffset = await recursiveSerializeRemoteValue(
      targetBuffer,
      0,
      result
    );

    return targetBuffer.seal(finalOffset);
  };

  const serializeColumn = async (
    type: Result.Result['type'],
    value: Result.Result['value'],
    start: number,
    end: number
  ): Promise<ArrayBuffer> => {
    if (type.kind !== 'column' && type.kind !== 'materialized-column') {
      throw new TypeError(`Expected column-like type and got ${type.kind}`);
    }
    const colValue: ValueTypes.ColumnLikeValue =
      Value.LeanColumn.fromGeneratorAndType(
        getResultGenerator(value ?? Unknown),
        type
      );
    const col = new Value.WriteSerializedColumn(
      valueEncoder(type.cellType),
      colValue
    );
    const targetBuffer = new Value.GrowableDataView(
      new ArrayBuffer(initialBufferSize, {
        maxByteLength: maxBufferSize,
      }),
      { pageSize }
    );
    const finalSize = await col.serialize(targetBuffer, 0, start, end);
    return targetBuffer.seal(finalSize);
  };

  const serializeNotification = async <TMeta extends object>(
    notification: TBaseNotificationParams<TMeta>
  ): Promise<TSerializedNotificationParams<TMeta>> => ({
    ...notification,
    result:
      notification.result == null
        ? notification.result
        : {
            type: notification.result.type,
            value: await serializeRemoteValue(notification.result),
          },
  });

  const rpc = new SharedRPC({
    target: {
      postMessage,
    },
    receiver: {
      readMessages,
    },
    serviceId: 'remote-computer-worker',
  });

  rpc.on('error', (error) => {
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
      const value = remoteValueStore.get(valueId) ?? unknownRemoteValue;
      if (
        value.type.kind === 'column' ||
        value.type.kind === 'materialized-column'
      ) {
        // serialize column
        return serializeColumn(value.type, value.value, start, end);
      }

      // serialize table
      return serializeTable(value.type, value.value);
    }
  );

  // This is called by the client to garbage-collect a value
  rpc.expose('releaseValue', ({ valueId }: { valueId: string }) => {
    remoteValueStore.delete(valueId);
  });

  const subscriptions = new Map<string, TUnsubscribe>();

  rpc.expose('subscribe', async (params: TSubscriptionParams) => {
    await rpc.isReady;
    const subscriptionId = nanoid();
    const unsubscribe = await subscribe(params, async (notification) => {
      if (subscriptions.has(subscriptionId)) {
        try {
          const serializedNotification = await serializeNotification({
            subscriptionId,
            ...notification,
          });
          await rpc.call('notify', serializedNotification);
        } catch (err) {
          console.error(err);
          throw err;
        }
      } else {
        console.warn(`Subscription id ${subscriptionId} not found`);
      }
    });
    subscriptions.set(subscriptionId, unsubscribe);
    return subscriptionId;
  });

  rpc.expose(
    'unsubscribe',
    ({ subscriptionId }: { subscriptionId: string }) => {
      const unsubscribe = subscriptions.get(subscriptionId);
      if (unsubscribe) {
        unsubscribe();
        subscriptions.delete(subscriptionId);
      }
    }
  );
};
