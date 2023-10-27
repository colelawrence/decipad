import stringify from 'json-stringify-safe';
import { MyDecorate } from '@decipad/editor-types';
import { Range } from 'slate';
import { ENode, PlateEditor, Value, getRange } from '@udecode/plate';

interface CacheEntry<P, TV extends Value, TE extends PlateEditor<TV>> {
  /** The same object might deserve a second annotate call */
  dedupeKey: string;
  decoratorRet: ReturnType<ReturnType<MyDecorate<P, TV, TE>>>;
}

export const memoizeDecorate = <
  P,
  TV extends Value,
  TE extends PlateEditor<TV>
>(
  decorate: MyDecorate<P, TV, TE>
): MyDecorate<P, TV, TE> => {
  const cache = new WeakMap<ENode<TV>, CacheEntry<P, TV, TE>>();

  return (editor, ...args) =>
    (entry) => {
      const dedupeKey = stringify({ entry });

      const cacheEntry = cache.get(entry[0]);
      if (cacheEntry && cacheEntry.dedupeKey === dedupeKey) {
        return cacheEntry.decoratorRet;
      }

      const decoratorRet = decorate(editor, ...args)(entry);

      cache.set(entry[0], { decoratorRet, dedupeKey });

      return decoratorRet;
    };
};

export const memoizeDecorateWithSelection = <
  P,
  TV extends Value,
  TE extends PlateEditor<TV>
>(
  decorate: MyDecorate<P, TV, TE>
): MyDecorate<P, TV, TE> => {
  const cache = new WeakMap<ENode<TV>, CacheEntry<P, TV, TE>>();

  return (editor, ...args) =>
    (entry) => {
      const selectionIntersectsPath =
        editor.selection != null &&
        Range.intersection(getRange(editor, entry[1]), editor.selection) !=
          null;

      const selectionKey = selectionIntersectsPath ? editor.selection : null;
      const dedupeKey = stringify({ selectionKey, entry });

      const cacheEntry = cache.get(entry[0]);
      if (cacheEntry && cacheEntry.dedupeKey === dedupeKey) {
        return cacheEntry.decoratorRet;
      }

      const decoratorRet = decorate(editor, ...args)(entry);

      cache.set(entry[0], { decoratorRet, dedupeKey });

      return decoratorRet;
    };
};
