import { isElement, Element, CodeLineElement } from '@decipad/editor-types';
import { getAbove } from '@udecode/plate';
import { Editor } from 'slate';
import { getCollapsedSelection } from '../../utils/selection';

export function getCursorPos(editor: Editor): string | null {
  const cursor = getCollapsedSelection(editor);

  if (cursor) {
    const codeLine = getAbove<Element | Editor>(editor, {
      at: cursor,
      match: (element) => 'type' in element && element.type === 'code_line',
    })?.[0] as CodeLineElement;

    if (isElement(codeLine)) {
      return codeLine.id;
    }
  }

  return null;
}
