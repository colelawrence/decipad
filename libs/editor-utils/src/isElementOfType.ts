import { MyElement } from '@decipad/editor-types';
import { isElement } from '@udecode/plate';
import { Node } from 'slate';

export const isElementOfType = <Type extends MyElement['type']>(
  node: Node | undefined,
  type: Type
): node is Extract<Element, { type: Type }> =>
  isElement(node) && node.type === type;
