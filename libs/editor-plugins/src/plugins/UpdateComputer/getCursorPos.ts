import { CodeLineElement, MyEditor } from '@decipad/editor-types';
import { getAboveNode, isElement } from '@udecode/plate';
import { getCollapsedSelection } from '@decipad/editor-utils';

export function getCursorPos(editor: MyEditor): string | null {
  try {
    const cursor = getCollapsedSelection(editor);

    if (cursor) {
      const codeLine = getAboveNode<CodeLineElement>(editor, {
        at: cursor,
        match: (element) => 'type' in element && element.type === 'code_line',
      })?.[0];

      if (isElement(codeLine)) {
        return codeLine.id;
      }
    }

    return null;
  } catch {
    // Not critical code
    return null;
  }
}
