import { insertNodes as plateInsertNodes } from '@udecode/plate-core';
import { getAnalytics } from '@decipad/client-events';
import { isElement, TElement } from '@udecode/plate';

const elementsFrom = (n: unknown | unknown[]): TElement[] => {
  const ret = Array.isArray(n) ? n : [n];
  return ret.filter(isElement);
};

export const insertNodes: typeof plateInsertNodes = (
  editor,
  options,
  ...args
) => {
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
