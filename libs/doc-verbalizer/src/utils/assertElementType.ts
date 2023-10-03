import type { MyElement } from '@decipad/editor-types';
import { isElement } from '@udecode/plate';
import type { Node } from 'slate';

export function assertElementType<Type extends MyElement['type']>(
  node: Node | undefined,
  type: Type
): asserts node is Extract<MyElement, { type: Type }> {
  if (!isElement(node) || node.type !== type) {
    throw new Error(`Expected element type to be ${type}`);
  }
}
