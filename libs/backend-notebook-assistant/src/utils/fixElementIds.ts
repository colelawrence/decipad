import type { RootDocument } from '@decipad/editor-types';
import { scanElementIds } from './scanElementIds';
import cloneDeep from 'lodash/cloneDeep';
import type { TElement } from '@udecode/plate-common';
import { isElement } from '@udecode/plate-common';
import { nanoid } from 'nanoid';

export const fixElementIds = (
  oldDoc: RootDocument,
  _newDoc: RootDocument
): RootDocument => {
  const newDoc = cloneDeep(_newDoc);
  const previousIds = scanElementIds(oldDoc);

  const fixElement = (el: TElement) => {
    if (previousIds.has(el.id as string)) {
      previousIds.delete(el.id as string);
    } else {
      // eslint-disable-next-line no-param-reassign
      el.id = nanoid();
    }
    for (const child of el.children) {
      if (isElement(child)) {
        fixElement(child);
      }
    }
  };

  for (const child of newDoc.children) {
    fixElement(child);
  }
  return newDoc;
};
