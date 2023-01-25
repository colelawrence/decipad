import {
  getNode,
  isEditor,
  isElement,
  isCollapsed,
  TNode,
} from '@udecode/plate';
import { BaseEditor, Editor, Node, Path, Point } from 'slate';

/** Is the cursor at the end|start of the parent element? */
export const isCursorAtBlockEdge = (
  editor: BaseEditor,
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

  const nonLeafElement = Editor.above(editor, {
    at: cursorPath,
    match: (n: Node) => Editor.isBlock(editor, n),
  });
  if (!nonLeafElement?.[0]?.children) {
    return false;
  }

  const [start, end] = Editor.edges(editor, nonLeafElement[1]);

  return (
    Point.compare(editor.selection.focus, edge === 'end' ? end : start) === 0
  );
};

const leafNodeInCollapsedSelection = (
  editor: BaseEditor,
  cursorPath?: Path
) => {
  if (!cursorPath) {
    return false;
  }

  const node = cursorPath && getNode(editor as TNode, cursorPath);
  return node != null && !isEditor(node) && !isElement(node) && 'text' in node;
};
