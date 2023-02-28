import { MyElement } from '@decipad/editor-types';
import { isElement } from '@udecode/plate';
import { Node } from 'slate';

export const isElementOfType = <Type extends MyElement['type']>(
  node: Node | null | undefined,
  type: Type
): node is Extract<MyElement, { type: Type }> =>
  isElement(node) && node.type === type;
