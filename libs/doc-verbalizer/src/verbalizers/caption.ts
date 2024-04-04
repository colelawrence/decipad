import type { AnyElement } from '../../../editor-types/src';
import { ELEMENT_CAPTION } from '../../../editor-types/src';
import { assertElementType } from '../utils/assertElementType';
import { getNodeString } from '../utils/getNodeString';

export const captionVerbalizer = (element: AnyElement): string => {
  assertElementType(element, ELEMENT_CAPTION);
  return getNodeString(element);
};
