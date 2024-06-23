import type {
  RemoteValueStore,
  TBaseNotificationParams,
  TSerializedNotificationParams,
} from '../types';
import { createValueEncoder } from './createValueEncoder';

export const createNotificationEncoder = (
  remoteValueStore: RemoteValueStore
) => {
  const encodeResult = createValueEncoder(remoteValueStore);
  return async <TMeta extends object>(
    subscriptionId: string,
    notification: TBaseNotificationParams<TMeta>
  ): Promise<TSerializedNotificationParams<TMeta>> => {
    return {
      ...notification,
      subscriptionId,
      result:
        notification.result == null
          ? notification.result
          : {
              type: notification.result.type,
              value: await encodeResult(notification.result),
            },
    };
  };
};
