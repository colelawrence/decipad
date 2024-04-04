import { type MyElement } from '@decipad/editor-types';
import { isElement } from '@udecode/plate-common';
import { type Node } from 'slate';

export const isElementOfType = <Type extends MyElement['type']>(
  node: Node | null | undefined,
  type: Type
): node is Extract<MyElement, { type: Type }> =>
  isElement(node) && node.type === type;
