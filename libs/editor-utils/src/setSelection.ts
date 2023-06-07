import { MyEditor } from '@decipad/editor-types';
import { BaseRange, Selection } from 'slate';
// eslint-disable-next-line no-restricted-imports
import { setSelection as plateSetSelection } from '@udecode/plate';
import { hasPoint } from './hasPoint';

const isValidSelection = (
  editor: MyEditor,
  sel: Partial<Selection>
): boolean => {
  if (sel != null) {
    if (sel.anchor && !hasPoint(editor, sel.anchor)) {
      return false;
    }
    if (sel.focus && !hasPoint(editor, sel.focus)) {
      return false;
    }
  }
  return true;
};

export function setSelection(editor: MyEditor, sel: Partial<Selection>): void {
  if (isValidSelection(editor, sel)) {
    plateSetSelection(editor, sel as BaseRange);
  }
}
