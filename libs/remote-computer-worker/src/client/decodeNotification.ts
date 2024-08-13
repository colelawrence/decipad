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
  const { result } = notification;
  const { meta } = result ?? {};
  return {
    ...notification,
    result:
      result == null
        ? undefined
        : {
            type: result.type,
            value: (
              await decodeRemoteValue(
                ctx,
                new DataView(result.value),
                0,
                result.type
              )
            )[0],
            meta: meta
              ? () => ({
                  ...meta,
                  labels: meta.labels
                    ? Promise.resolve(meta.labels)
                    : undefined,
                })
              : undefined,
          },
  };
};
