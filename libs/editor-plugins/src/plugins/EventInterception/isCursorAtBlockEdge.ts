import {
  getAboveNode,
  getEdgePoints,
  getNode,
  isBlock,
  isCollapsed,
  isEditor,
  isElement,
  TNode,
} from '@udecode/plate';
import { Path, Point } from 'slate';
import { MyEditor } from '@decipad/editor-types';

/** Is the cursor at the end|start of the parent element? */
export const isCursorAtBlockEdge = (
  editor: MyEditor,
  edge: 'end' | 'start'
): boolean => {
  const cursorPath =
    editor.selection && isCollapsed(editor.selection)
      ? editor.selection.focus.path
      : undefined;

  const cursorInLeafNode = leafNodeInCollapsedSelection(editor, cursorPath);
  if (!cursorInLeafNode || !cursorPath || !editor.selection) {
    return false;
  }

  const nonLeafElement = getAboveNode(editor, {
    at: cursorPath,
    match: (n) => isBlock(editor, n),
  });
  if (!nonLeafElement?.[0]?.children) {
    return false;
  }

  const [start, end] = getEdgePoints(editor, nonLeafElement[1]);

  return (
    Point.compare(editor.selection.focus, edge === 'end' ? end : start) === 0
  );
};

const leafNodeInCollapsedSelection = (editor: MyEditor, cursorPath?: Path) => {
  if (!cursorPath) {
    return false;
  }

  const node = cursorPath && getNode(editor as TNode, cursorPath);
  return node != null && !isEditor(node) && !isElement(node) && 'text' in node;
};
