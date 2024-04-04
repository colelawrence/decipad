import type { AnyElement, MyElement } from '@decipad/editor-types';
import { type TElement, isElement } from '@udecode/plate-common';
import { type Node } from 'slate';

export function assertElementType<Type extends AnyElement['type']>(
  node: Node | undefined,
  type: Type
): asserts node is Extract<MyElement, { type: Type }> {
  if (!isElement(node) || node.type !== type) {
    throw new Error(
      `Expected element type to be ${type} and is ${
        (node as TElement | undefined)?.type
      }`
    );
  }
}

export function assertElementMultipleType<Type extends AnyElement['type']>(
  node: Node | undefined,
  types: Type[]
): asserts node is Extract<AnyElement, { type: Type }> {
  if (!isElement(node) || !types.includes(node.type as Type)) {
    throw new Error(
      `Expected element type to be ${types.join(', ')} and is ${
        (node as AnyElement | undefined)?.type
      }`
    );
  }
}
