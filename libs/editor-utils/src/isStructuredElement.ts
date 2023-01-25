import {
  CodeLineV2Element,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_STRUCTURED_IN,
  StructuredInputElement,
} from '@decipad/editor-types';
import { isElement } from '@udecode/plate';

const types = [ELEMENT_STRUCTURED_IN, ELEMENT_CODE_LINE_V2];

export function isStructuredElement(
  element: unknown
): element is StructuredInputElement | CodeLineV2Element {
  return isElement(element) && types.includes(element.type);
}
