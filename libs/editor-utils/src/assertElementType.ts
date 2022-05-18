import { Element, isElement } from '@decipad/editor-types';
import { Node } from 'slate';

export function assertElementType<Type extends Element['type']>(
  node: Node | undefined,
  type: Type
): asserts node is Extract<Element, { type: Type }> {
  if (!isElement(node) || node.type !== type) {
    throw new Error(`Expected element type to be ${type}`);
  }
}
