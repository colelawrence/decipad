import type { Result, SerializedType } from '@decipad/language-interfaces';
import type { PromiseOrType } from '@decipad/utils';
import type { RemoteValueStore } from '../types';

export type RecursiveEncoder = (
  type: SerializedType,
  buffer: DataView,
  value: Result.OneResult,
  offset: number,
  encoders: Record<SerializedType['kind'], RecursiveEncoder>
) => PromiseOrType<number>;

export interface RemoteValueReference {
  type: 'remote-value-ref';
  id: string;
}

export interface InlineValueReference {
  type: 'inline-value-ref';
  serialized: ArrayBuffer;
}

export type ValueReference = RemoteValueReference | InlineValueReference;

export type TUnsubscribe = () => void;

export interface CreateWorkerWorkerOptions<
  TSubscribeOptions,
  TNotification,
  TSerializedNotification
> {
  postMessage: (data: TNotification) => void;
  readMessages: (cb: (ev: MessageEvent) => void) => () => void;
  subscribe: (
    options: TSubscribeOptions,
    listener: (notificationParams: TNotification) => unknown
  ) => PromiseOrType<TUnsubscribe>;
  serializeNotificationFromStore?: (
    remoteValueStore: RemoteValueStore
  ) => (
    subscriptionId: string,
    notification: TNotification
  ) => Promise<TSerializedNotification>;
  serviceId: string;
}
