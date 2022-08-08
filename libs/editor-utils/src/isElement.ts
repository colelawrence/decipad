import { AnyElement, allElementKinds } from '@decipad/editor-types';
import { TElement } from '@udecode/plate';

export function isElement(el: TElement): el is AnyElement {
  return allElementKinds.includes(el.type);
}
