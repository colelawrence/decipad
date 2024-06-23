import type {
  TBaseNotificationParams,
  TSerializedNotificationParams,
} from '../types';
import type { ClientWorkerContext } from './types';
import { decodeRemoteValue } from './decodeRemoteValue';

export const decodeNotification = async <TMeta extends object = object>(
  ctx: ClientWorkerContext,
  _subscriptionParams: object,
  _notification: object
): Promise<TBaseNotificationParams<TMeta>> => {
  const notification = _notification as TSerializedNotificationParams<TMeta>;
  return {
    ...notification,
    result:
      notification.result == null
        ? undefined
        : {
            type: notification.result.type,
            value: (
              await decodeRemoteValue(
                ctx,
                new DataView(notification.result.value),
                0,
                notification.result.type
              )
            )[0],
          },
  };
};
