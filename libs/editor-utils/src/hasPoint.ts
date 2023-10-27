import { Point } from 'slate';
import { getNode, getNodeString, TEditor, Value } from '@udecode/plate';

export const hasPoint = <
  TV extends Value,
  TE extends TEditor<TV> = TEditor<TV>
>(
  editor: TE,
  point: Point
) => {
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
