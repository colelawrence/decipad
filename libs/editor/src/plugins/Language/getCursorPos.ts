import { Editor } from 'slate';
import { getCollapsedSelection } from '../../utils/selection';
import { isSlateNode } from './common';

export function getCursorPos(editor: Editor): string | null {
  const cursor = getCollapsedSelection(editor);

  if (cursor) {
    const codeLine = Editor.above(editor, {
      at: cursor,
      match: (node) => isSlateNode(node) && node.type === 'code_line',
    })?.[0];

    if (isSlateNode(codeLine)) {
      return codeLine.id;
    }
  }

  return null;
}
