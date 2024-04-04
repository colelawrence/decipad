import { type Path } from 'slate';
import {
  findNodePath,
  toSlateNode,
  type TReactEditor,
} from '@udecode/plate-common';

export const findDomNodePath = (
  editor: TReactEditor,
  node: Node
): Path | undefined => {
  const slateNode = toSlateNode(editor, node);
  if (!slateNode) return;

  return findNodePath(editor, slateNode);
};
