import type { TableElement } from '@decipad/editor-types';
import { ELEMENT_TABLE } from '@decipad/editor-types';
import { isElement } from '@udecode/plate-common';
import type { Node } from 'slate';

export const isTable = (node: Node): node is TableElement => {
  return isElement(node) && node.type === ELEMENT_TABLE;
};
