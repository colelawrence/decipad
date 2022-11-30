import { MyDecorate, MyNodeEntry } from '@decipad/editor-types';
import { BaseEditor, Editor, Range } from 'slate';

interface CacheEntry {
  /** The same object might deserve a second annotate call */
  dedupeKey: string;
  decoratorRet: ReturnType<ReturnType<MyDecorate>>;
}

export const memoizeDecorate = (decorate: MyDecorate): MyDecorate => {
  const cache = new WeakMap<MyNodeEntry[0], CacheEntry>();

  return (editor, ...args) =>
    (entry) => {
      const dedupeKey = JSON.stringify({ entry });

      const cacheEntry = cache.get(entry[0]);
      if (cacheEntry && cacheEntry.dedupeKey === dedupeKey) {
        return cacheEntry.decoratorRet;
      }

      const decoratorRet = decorate(editor, ...args)(entry);

      cache.set(entry[0], { decoratorRet, dedupeKey });

      return decoratorRet;
    };
};

export const memoizeDecorateWithSelection = (
  decorate: MyDecorate
): MyDecorate => {
  const cache = new WeakMap<MyNodeEntry[0], CacheEntry>();

  return (editor, ...args) =>
    (entry) => {
      const selectionIntersectsPath =
        editor.selection != null &&
        Range.intersection(
          Editor.range(editor as BaseEditor, entry[1]),
          editor.selection
        ) != null;

      const selectionKey = selectionIntersectsPath ? editor.selection : null;
      const dedupeKey = JSON.stringify({ selectionKey, entry });

      const cacheEntry = cache.get(entry[0]);
      if (cacheEntry && cacheEntry.dedupeKey === dedupeKey) {
        return cacheEntry.decoratorRet;
      }

      const decoratorRet = decorate(editor, ...args)(entry);

      cache.set(entry[0], { decoratorRet, dedupeKey });

      return decoratorRet;
    };
};
