import { AnyElement, ELEMENT_CAPTION } from '../../../editor-types/src';
import { getNodeString } from '@udecode/plate-common';
import { assertElementType } from '../utils/assertElementType';

export const captionVerbalizer = (element: AnyElement): string => {
  assertElementType(element, ELEMENT_CAPTION);
  return getNodeString(element);
};
