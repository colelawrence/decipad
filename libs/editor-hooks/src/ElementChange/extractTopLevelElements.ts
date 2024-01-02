import { ELEMENT_COLUMNS, ELEMENT_TAB } from '@decipad/editor-types';
import { AnyElement, RootDocument } from '../../../editor-types/src/value';
import { isElement } from '@udecode/plate-common';

export const extractTopLevelElements = (
  base: RootDocument | AnyElement
): Array<AnyElement> => {
  return base.children.flatMap((child) => {
    if (isElement(child)) {
      if (child.type === ELEMENT_TAB || child.type === ELEMENT_COLUMNS) {
        return extractTopLevelElements(child);
      }
      return [child];
    }
    return [];
  });
};
