import type { AnyElement, ElementKind } from '../../../editor-types/src';
import { ELEMENT_H1, ELEMENT_H2, ELEMENT_H3 } from '../../../editor-types/src';
import { getNodeString } from '../utils/getNodeString';

const markdownPrefix: Partial<Record<ElementKind, string>> = {
  [ELEMENT_H1]: '#',
  [ELEMENT_H2]: '##',
  [ELEMENT_H3]: '###',
};

export const headingVerbalizer = (element: AnyElement): string => {
  const prefix = markdownPrefix[element.type];
  if (prefix) {
    return `${prefix} ${getNodeString(element)}`;
  }
  throw new TypeError(`Expected heading type and got ${element.type}`);
};
