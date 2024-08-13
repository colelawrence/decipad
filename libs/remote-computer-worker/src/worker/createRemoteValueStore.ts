import type { Result } from '@decipad/language-interfaces';
import type { RemoteValueStore } from '../types';

export const createRemoteValueStore = (): RemoteValueStore => {
  const store = new Map<string, Result.Result | string>();
  const latestBlockToIdMap = new Map<string, string>();

  const get = (id: string): Result.Result | undefined => {
    const valueOrNewId = store.get(id);
    if (typeof valueOrNewId === 'string') {
      return get(valueOrNewId);
    }

    return valueOrNewId;
  };

  const set = (
    blockId: string | undefined,
    id: string,
    value: Result.Result
  ) => {
    store.set(id, value);
    if (blockId) {
      const previousValueId = latestBlockToIdMap.get(blockId);
      if (previousValueId) {
        store.set(previousValueId, id);
      }
      latestBlockToIdMap.set(blockId, id);
    }
  };

  return {
    get,
    set,
    delete: (id: string) => store.delete(id),
  };
};
