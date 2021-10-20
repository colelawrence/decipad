import { isCollapsed } from '@udecode/plate';
import { Editor, Range } from 'slate';
import { isSlateNode } from './common';

export type CursorPos = [string, number];

export function getCursorPos(editor: Editor): CursorPos | null {
  const { selection } = editor;

  if (selection && isCollapsed(selection)) {
    const cursor = Range.start(selection);

    const codeBlock = Editor.above(editor, {
      at: cursor,
      match: (node) => isSlateNode(node) && node.type === 'code_block',
    })?.[0];

    if (isSlateNode(codeBlock)) {
      const foundLine = cursor.path[1] + 1; // Program lines are one-based.
      return [codeBlock.id, foundLine];
    }
  }

  return null;
}
