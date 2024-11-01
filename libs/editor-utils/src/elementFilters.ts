import {
  AnyElement,
  ELEMENT_INTEGRATION,
  ELEMENT_TABLE,
  Filter,
  FilterableElement,
} from '@decipad/editor-types';
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';

const typesWithFilters = Object.freeze(
  new Set([ELEMENT_TABLE, ELEMENT_CODE_BLOCK, ELEMENT_INTEGRATION])
);

const isFilterableElement = (
  element: AnyElement
): element is FilterableElement => {
  return typesWithFilters.has(element.type);
};

export const elementFilters = (element: AnyElement | undefined): Filter[] => {
  if (element != null && isFilterableElement(element)) {
    return element.filters ?? [];
  }
  return [];
};
