import { MyDecorate, MyNodeEntry } from '@decipad/editor-types';

interface CacheEntry {
  /** The same object might deserve a second annotate call */
  dedupeKey: string;
  decoratorRet: ReturnType<ReturnType<MyDecorate>>;
}

export const memoizeDecorate = (decorate: MyDecorate): MyDecorate => {
  const cache = new WeakMap<MyNodeEntry[0], CacheEntry>();

  return (...args) =>
    (entry) => {
      const dedupeKey = JSON.stringify(entry);

      const cacheEntry = cache.get(entry[0]);
      if (cacheEntry && cacheEntry.dedupeKey === dedupeKey) {
        return cacheEntry.decoratorRet;
      }

      const decoratorRet = decorate(...args)(entry);

      cache.set(entry[0], { decoratorRet, dedupeKey });

      return decoratorRet;
    };
};
