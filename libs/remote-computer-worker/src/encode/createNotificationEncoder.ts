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
    const { result, blockId } = notification;
    const { meta } = result ?? {};
    const metaValue = meta?.();
    const serializedMeta = metaValue && {
      ...metaValue,
      labels: await metaValue.labels,
    };
    return {
      ...notification,
      subscriptionId,
      result:
        result == null
          ? result
          : {
              type: result.type,
              value: await encodeResult(blockId, result),
              meta: serializedMeta,
            },
    };
  };
};
