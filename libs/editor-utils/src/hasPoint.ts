import { MyEditor } from '@decipad/editor-types';
import { Point } from 'slate';
import { getNode, getNodeString } from '@udecode/plate';

export const hasPoint = (editor: MyEditor, point: Point) => {
  const node = getNode(editor, point.path);
  if (!node) {
    return false;
  }
  const nodeString = getNodeString(node);
  if (nodeString.length < point.offset) {
    return false;
  }
  return true;
};
