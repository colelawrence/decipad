import {
  insertNodes as plateInsertNodes,
  isElement,
  type TElement,
  type Value,
  type EElementOrText,
  type TEditor,
  type InsertNodesOptions,
} from '@udecode/plate';
import { getAnalytics } from '@decipad/client-events';

const elementsFrom = (n: unknown | unknown[]): TElement[] => {
  const ret = Array.isArray(n) ? n : [n];
  return ret.filter(isElement);
};

type InsertNodes = <N extends EElementOrText<V>, V extends Value = Value>(
  editor: TEditor<V>,
  nodes: N[],
  options?: InsertNodesOptions<V> | undefined
) => void;

export const insertNodes: InsertNodes = (editor, options, ...args) => {
  setTimeout(() => {
    const analytics = getAnalytics();
    if (analytics) {
      for (const el of elementsFrom(options)) {
        analytics.track('create notebook element', { type: el.type });
      }
    }
  }, 0);
  return plateInsertNodes(editor, options, ...args);
};
