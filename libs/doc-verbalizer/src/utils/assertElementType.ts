import type { AnyElement } from '@decipad/editor-types';
import { isElement } from '@udecode/plate-common';
import type { Node } from 'slate';

export function assertElementType<Type extends AnyElement['type']>(
  node: Node | undefined,
  type: Type
): asserts node is Extract<AnyElement, { type: Type }> {
  if (!isElement(node) || node.type !== type) {
    throw new Error(`Expected element type to be ${type}`);
  }
}
