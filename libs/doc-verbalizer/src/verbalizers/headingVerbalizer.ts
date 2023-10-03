import {
  AnyElement,
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ElementKind,
} from '../../../editor-types/src';
import { getNodeString } from '@udecode/plate';

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
