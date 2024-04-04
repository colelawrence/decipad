import { type AnyElement, allElementKinds } from '@decipad/editor-types';
import { type TElement } from '@udecode/plate-common';
import { type Node } from 'slate';

export function isElement(
  el: TElement | Node | null | undefined
): el is AnyElement {
  return el ? 'type' in el && allElementKinds.includes(el.type) : false;
}
