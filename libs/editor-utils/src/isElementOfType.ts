import { Element, isElement } from '@decipad/editor-types';
import { Node } from 'slate';

export const isElementOfType = <Type extends Element['type']>(
  node: Node | undefined,
  type: Type
): node is Extract<Element, { type: Type }> =>
  isElement(node) && node.type === type;
