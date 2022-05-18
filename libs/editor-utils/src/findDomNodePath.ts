import { Path } from 'slate';
import { findNodePath, toSlateNode, TReactEditor } from '@udecode/plate';

export const findDomNodePath = (
  editor: TReactEditor,
  node: Node
): Path | undefined => {
  const slateNode = toSlateNode(editor, node);
  if (!slateNode) return;

  return findNodePath(editor, slateNode);
};
