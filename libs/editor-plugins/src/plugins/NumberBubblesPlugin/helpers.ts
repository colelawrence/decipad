/* istanbul ignore file */
import {
  findNodePath,
  focusEditor,
  getNextNode,
  getEndPoint,
  TReactEditor,
  getNodeString,
  insertText,
  getAboveNode,
  getPreviousNode,
  getStartPoint,
  getEditorString,
  getBlockAbove,
} from '@udecode/plate';
import {
  BlockElement,
  ELEMENT_INLINE_NUMBER,
  InlineNumberElement,
  MyEditor,
} from '@decipad/editor-types';
import { requireCollapsedSelection } from '@decipad/editor-utils';
import { BasePoint } from 'slate';

export const isSelectionBordersBubble = (
  editor: TReactEditor
): 'left' | 'right' | null => {
  requireCollapsedSelection(editor);

  const next = getNextNode(editor);
  const nextParent = next
    ? getAboveNode(editor, { at: next[1] })?.[0]
    : undefined;

  if (nextParent?.type === ELEMENT_INLINE_NUMBER) return 'left';

  const prev = getPreviousNode(editor);
  const prevParent = prev
    ? getAboveNode(editor, { at: prev[1] })?.[0]
    : undefined;

  if (prevParent?.type === ELEMENT_INLINE_NUMBER) return 'right';

  return null;
};

export const focusInlineNumberStart = (editor: TReactEditor) => {
  const next = getNextNode(editor);
  if (!next) throw new Error("Can't find inline number");

  const bubbleStart = getStartPoint(editor, next[1]);
  const newPosition = { ...bubbleStart, offset: bubbleStart.offset - 1 };

  focusEditor(editor, {
    focus: newPosition,
    anchor: newPosition,
  });
};

export const focusInlineNumberEnd = (editor: TReactEditor) => {
  const next = getPreviousNode(editor);
  if (!next) throw new Error("Can't find inline number");

  const bubbleEnd = getEndPoint(editor, next[1]);
  const newPosition = { ...bubbleEnd, offset: bubbleEnd.offset + 1 };

  focusEditor(editor, {
    focus: newPosition,
    anchor: newPosition,
  });
};

export const jumpOutInlineNumber = (
  editor: TReactEditor,
  node: InlineNumberElement
) => {
  const bubblePath = findNodePath(editor, node);
  if (!bubblePath) return;

  const nextNode = getNextNode(editor, {
    at: bubblePath,
  });
  if (!nextNode) return;

  const [, nextPath] = nextNode;
  const endPoint = getEndPoint(editor, nextPath);

  focusEditor(editor, {
    focus: endPoint,
    anchor: endPoint,
  });
};

export const cleanUpInlineNumber = (
  editor: TReactEditor,
  node: InlineNumberElement
) => {
  const nodePath = findNodePath(editor, node);
  const text = getNodeString(node);
  const clean = text
    // Remove leading spaces
    .replace(/^[\u200B-\u200D\uFEFF\s]+/, '')
    // Remove trailing spaces
    .replace(/[\u200B-\u200D\uFEFF\s]+$/, '')
    // Remove trailing dot (macOS behavior)
    .replace(/\.$/, '');

  insertText(editor, clean, { at: nodePath });
};

export const isCursorNextToNonSpace = (editor: MyEditor) => {
  const selection = requireCollapsedSelection(editor);

  const textBefore = getTextBeforeCursor(editor, selection);
  const leftIsNonSpace = textBefore === '' || textBefore.endsWith(' ');

  const textAfter = getTextAfterCursor(editor, selection);
  const rightIsNonSpace = textAfter === '' || textAfter.startsWith(' ');

  return leftIsNonSpace && rightIsNonSpace;
};

const getTextBeforeCursor = (editor: MyEditor, cursor: BasePoint) =>
  getEditorString(editor, {
    anchor: { path: cursor.path, offset: 0 },
    focus: { path: cursor.path, offset: cursor.offset },
  });

const getTextAfterCursor = (editor: MyEditor, cursor: BasePoint) => {
  const entry = getBlockAbove<BlockElement>(editor, { at: cursor });
  const endPoint = getEndPoint(editor, entry ? entry[1] : cursor);

  return getEditorString(editor, {
    anchor: { path: cursor.path, offset: cursor.offset },
    focus: { path: endPoint.path, offset: endPoint.offset },
  });
};
