import {
  CodeLineV2Element,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_INTEGRATION,
  ELEMENT_STRUCTURED_IN,
  IntegrationTypes,
  StructuredInputElement,
} from '@decipad/editor-types';
import { isElement } from '@udecode/plate';

const types = [
  ELEMENT_STRUCTURED_IN,
  ELEMENT_CODE_LINE_V2,
  ELEMENT_INTEGRATION,
];

export function isStructuredElement(
  element: unknown
): element is
  | StructuredInputElement
  | CodeLineV2Element
  | IntegrationTypes.IntegrationBlock {
  return isElement(element) && types.includes(element.type);
}
