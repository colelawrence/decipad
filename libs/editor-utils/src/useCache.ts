import { identity } from 'ramda';
import { useEffect, useMemo, useState } from 'react';

interface UseCacheProps<V> {
  blockId: string;
  value: V | undefined;
  deleted: boolean;
  cacheKey?: string;
  deserialize: (v: V) => V;
}

const fetchValue = <V>(key: string): V | undefined => {
  try {
    const serializedValue = localStorage.getItem(key);
    if (serializedValue) {
      return JSON.parse(serializedValue) as V;
    }
  } catch (err) {
    console.error('Error fetching value:', err);
  }
  return undefined;
};

const saveValue = <V>(key: string, value: V): void => {
  try {
    const serializedValue = JSON.stringify(value);
    localStorage.setItem(key, serializedValue);
  } catch (err) {
    console.error('Error storing value:', err);
  }
};

export const useCache = <V>({
  blockId,
  value,
  deleted,
  cacheKey = 'cache',
  deserialize = identity,
}: UseCacheProps<V>): V | undefined => {
  const [cachedValue, setCachedValue] = useState(() => value);

  const fullCacheKey = useMemo(
    () => `${blockId}:${cacheKey}`,
    [cacheKey, blockId]
  );
  useEffect(() => {
    if (deleted) {
      localStorage.removeItem(fullCacheKey);
    }
  }, [deleted, fullCacheKey]);

  useEffect(() => {
    // fetch the value
    if (!cachedValue) {
      const fetchedValue = fetchValue<V>(fullCacheKey);
      if (fetchedValue != null) {
        setCachedValue(deserialize(fetchedValue));
      }
    }
  }, [cachedValue, deserialize, fullCacheKey]);

  useEffect(() => {
    if (value) {
      setCachedValue(value);
      requestAnimationFrame(() => {
        saveValue(fullCacheKey, value);
      });
    }
  }, [fullCacheKey, value]);

  useEffect(() => {
    if (cachedValue && deleted) {
      localStorage.removeItem(fullCacheKey);
    }
  });

  return cachedValue;
};
