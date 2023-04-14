import { LiveConnectionElement } from '@decipad/editor-types';
import { Result } from '@decipad/computer';
import { create, useStore } from 'zustand';
import { useCallback, useMemo } from 'react';

export interface StoreResult {
  loading?: boolean;
  result?: Result.Result;
  rawResult?: Record<string, unknown> | string;
  error?: Error;
}

const liveConnectionStore = create(
  () => new WeakMap<LiveConnectionElement, StoreResult>()
);

type StoreSetter = (result: StoreResult) => void;

type UseLiveConnectionStoreResult = [StoreResult, StoreSetter];

export const useLiveConnectionStore = (
  element?: LiveConnectionElement
): UseLiveConnectionStoreResult => {
  const store = useStore(liveConnectionStore);

  const set = useCallback(
    (result: StoreResult) => element && store.set(element, result),
    [element, store]
  );
  const result = element && store.get(element);
  return useMemo(() => [result || { loading: false }, set], [result, set]);
};
