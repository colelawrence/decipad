import { ELEMENT_TABLE, TableElement } from '@decipad/editor-types';
import { isElement } from '@udecode/plate-common';
import { Node } from 'slate';

export const isTable = (node: Node): node is TableElement => {
  return isElement(node) && node.type === ELEMENT_TABLE;
};
