import { AnyElement, allElementKinds } from '@decipad/editor-types';
import { TElement } from '@udecode/plate';
import { Node } from 'slate';

export function isElement(
  el: TElement | Node | null | undefined
): el is AnyElement {
  return el ? 'type' in el && allElementKinds.includes(el.type) : false;
}
