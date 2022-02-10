import { isCollapsed } from '@udecode/plate';
import { Editor, Range } from 'slate';
import { isSlateNode } from './common';

export type CursorPos = [string, number];

export function getCursorPos(editor: Editor): CursorPos | null {
  const { selection } = editor;

  if (selection && isCollapsed(selection)) {
    const cursor = Range.start(selection);

    const codeLine = Editor.above(editor, {
      at: cursor,
      match: (node) => isSlateNode(node) && node.type === 'code_line',
    })?.[0];

    if (isSlateNode(codeLine)) {
      // Defaults to index 1 as a code line is a single statement
      return [codeLine.id, 1];
    }
  }

  return null;
}
